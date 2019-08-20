/**
 * Passport data structure

+------------+------------+------------+-------------+
|20 bytes    | 4 bytes    | 4 bytes    | 4 bytes     |
|name str    | picId      | CO2 locked | CO2 emitted |
+------------+------------+------------+-------------+

*/

import Web3 from "web3";
import { bytesToHex, padLeft, fromWei, toWei } from "web3-utils";
import { ecsign, hashPersonalMessage } from "ethereumjs-util";
import { PlasmaContract, consolidateUTXOs } from "./plasma-utils";
import { Tx } from "leap-core";
import { timeLeft } from "./cooldown";

const EarthContractData = require("./contracts/Earth.json");
EarthContractData.code = Buffer.from(
  EarthContractData.code.replace("0x", ""),
  "hex"
);
console.log("earth address", EarthContractData.address);

export const CO2_PER_GOELLAR = 2;
const AirContractData = require("./contracts/Air.json");
AirContractData.code = Buffer.from(
  AirContractData.code.replace("0x", ""),
  "hex"
);
const BN = Web3.utils.BN;

const USA_ADDR = "0x3378420181474D3aad9579907995011D6a545E3D";
const USB_ADDR = "0x181fc600915c35F4e44d41f9203A7c389b4A7189";

const COUNTRY_TO_ADDR = {
  "49156": USA_ADDR,
  "49155": USB_ADDR
};
const LEAP_COLOR = 0;
const CO2_COLOR = 2;
const GOELLARS_COLOR = 3;

export const gte = lower => o =>
  new BN(o.output.value).gte(new BN(toWei(lower.toString())));
// Select a random element from a list, see below for usage
export const choice = arr => arr[Math.floor(Math.random() * arr.length)];

function calculateUpdatedCO2(passportData, amount) {
  const n = new BN(passportData.replace("0x", ""), 16);
  n.iadd(new BN(amount));
  return padLeft(n.toString(16), 64);
}

// Defect: increase CO2Locked in passport receipt by 1.
function calculateStartDefect(passportData) {
  const n = new BN(passportData.replace("0x", ""), 16);
  // a.bincn(b) - add 1 << b to the number
  n.bincn(32);
  return padLeft(n.toString(16), 64);
}

async function hashAndSign(web3, buffer, address, privateKey) {
  if (privateKey) {
    const { r, s, v } = ecsign(
      hashPersonalMessage(buffer),
      Buffer.from(privateKey.replace("0x", ""), "hex")
    );
    const full = Array.from(r)
      .concat(Array.from(s))
      .concat([v]);
    return bytesToHex(full);
  } else {
    return await web3.eth.personal.sign("0x" + buffer.toString("hex"), address);
  }

  // Web3:
  //return await web3.eth.personal.sign(buffer.toString(), address, null);
}

function unpackReceipt(receipt) {
  const [address, color, value, data, signature] = receipt.split(";");
  return { address, color, value, data, signature };
}

async function findPassportOutput(plasma, address, color, value) {
  const passports = await plasma.getUnspent(address, color);
  return passports.filter(p => p.output.value === value)[0];
}

export async function startHandshake(
  web3,
  passport,
  privateKey,
  strategy = "collaborate"
) {
  // For now we hardcode the CO₂ emitted by 8 Gt, why 8 Gt? Answer here:
  // https://docs.google.com/spreadsheets/d/1chB4P7C594ABGn2u3VQb73t2F_0YPq26OHGJt0ZuME0/edit#gid=0
  let passportDataAfter;

  if (strategy === "collaborate") {
    passportDataAfter = calculateUpdatedCO2(passport.output.data, "1");
  } else if (strategy === "defect") {
    passportDataAfter = calculateUpdatedCO2(passport.output.data, "100");
    passportDataAfter = calculateStartDefect(passportDataAfter);
  }

  const signature = await hashAndSign(
    web3,
    Buffer.from(
      passport.output.data.replace("0x", "") + passportDataAfter,
      "hex"
    ),
    passport.output.address,
    privateKey
  );
  const receipt = [
    passport.output.address,
    passport.output.color,
    passport.output.value,
    passportDataAfter,
    signature
  ].join(";");

  console.log(passport.output.data, passportDataAfter);

  return receipt;
}

export async function finalizeHandshake(
  plasma,
  passport,
  receipt,
  privateKey,
  strategy = "collaborate"
) {
  // NOTE: Leapdao's Plasma implementation currently doesn't return receipts.
  // We hence have to periodically query the leap node to check whether our
  // transaction has been included into the chain. We assume that if it hasn't
  // been included after 5000ms (50 rounds at a 100ms timeout), it failed.
  // Unfortunately, at this point we cannot provide an error message for why

  let txHash, finalReceipt;
  let rounds = 50;
  const theirPassport = unpackReceipt(receipt).value;
  const wait = timeLeft(passport.output.value, theirPassport);
  if (wait > 0) {
    const period = Math.round(wait / 1000);
    const errorMessage = new Error(
      `Wait ${period} seconds before handshaking with the same player.`
    );
    throw errorMessage;
  }

  try {
    return await _finalizeHandshake(
      plasma,
      passport,
      receipt,
      privateKey,
      strategy
    );
  } catch (err) {
    console.log("Error finalizing handshake", err);
    throw err;
  }
}

async function _finalizeHandshake(
  plasma,
  passport,
  receipt,
  privateKey,
  strategy
) {
  const theirPassport = unpackReceipt(receipt);
  const theirPassportOutput = await findPassportOutput(
    plasma,
    theirPassport.address,
    theirPassport.color,
    theirPassport.value
  );

  // TODO: remove filters.
  const earthLeapOutput = choice(
    (await plasma.getUnspent(EarthContractData.address, LEAP_COLOR)).filter(
      gte(0.00001)
    )
  );
  const earthCO2Output = choice(
    (await plasma.getUnspent(EarthContractData.address, CO2_COLOR)).filter(
      gte(1)
    )
  );
  const earthGoellarsOutput = choice(
    (await plasma.getUnspent(EarthContractData.address, GOELLARS_COLOR)).filter(
      gte(1)
    )
  );

  //console.log('handshake', earthLeapOutput, earthCO2Output, earthGoellarsOutput)

  const inputs = [
    {
      prevout: earthLeapOutput.outpoint,
      script: EarthContractData.code,
      address: earthLeapOutput.output.address
    },
    {
      address: earthCO2Output.output.address,
      prevout: earthCO2Output.outpoint
    },
    {
      address: earthGoellarsOutput.output.address,
      prevout: earthGoellarsOutput.outpoint
    },
    {
      address: theirPassportOutput.output.address,
      prevout: theirPassportOutput.outpoint
    },
    { address: passport.output.address, prevout: passport.outpoint }
  ];

  if (strategy === "defect") {
    const myGoellarsOutput = (await plasma.getUnspent(
      passport.output.address,
      GOELLARS_COLOR
    ))[0];
    inputs.push({ prevout: myGoellarsOutput.outpoint });
  }

  const earthContract = new PlasmaContract(plasma, EarthContractData.abi);
  return await earthContract.methods
    .trade(
      theirPassport.value,
      "0x" + theirPassport.data,
      theirPassport.signature,
      passport.output.value,
      COUNTRY_TO_ADDR[theirPassport.color],
      COUNTRY_TO_ADDR[passport.output.color]
    )
    .send(inputs, privateKey);
}

export async function maxCO2Available(plasma) {
    return Math.max(...(await plasma.getUnspent(AirContractData.address, CO2_COLOR)).map(
      ({ output: { value } }) => fromWei(value)
    ).map(Number))
}

// 1 Göllar locks 16Gt of CO₂
export async function plantTrees(plasma, passport, goellars, privateKey) {
  const amount = new BN(CO2_PER_GOELLAR).mul(new BN(goellars));
  goellars = toWei(goellars.toString());
  const address = passport.unspent.output.address;
  let goellarOutputs;

  while (true) {
    const goellarUnspent = await plasma.getUnspent(address, GOELLARS_COLOR);
    goellarOutputs = Tx.calcInputs(
      goellarUnspent,
      address,
      goellars,
      GOELLARS_COLOR
    );
    // lockCO2 has 3 inputs already in use, so we have up to 12 inputs we
    // can use for Goellars
    if (goellarOutputs.length <= 12) {
      break;
    }
    console.log("consolidating");
    // Since we are doing an extra transaction to consolidate,
    // we use all available inputs.
    await consolidateUTXOs(
      goellarUnspent.splice(0, 15),
      plasma,
      null,
      privateKey
    );
  }

  const goellarOutpoints = goellarOutputs.map(({ prevout }) => ({
    prevout,
    address
  }));

  const airContract = new PlasmaContract(plasma, AirContractData.abi);
  const airLeapOutput = choice(
    await plasma.getUnspent(AirContractData.address, LEAP_COLOR)
  );
  const airCO2Output = choice(
    (await plasma.getUnspent(AirContractData.address, CO2_COLOR)).filter(
      gte(amount.toString())
    )
  );
  //console.log(airLeapOutput, airCO2Output, amount.toString());

  /*
  console.log(
    (await plasma.getUnspent(AirContractData.address, CO2_COLOR)).map(
      ({ output: { value } }) => fromWei(value)
    )
  );
  */

  if (!(airLeapOutput && airCO2Output)) {
    throw new Error("Not enough clouds in the air");
  }

  const inputs = [
    {
      address: airLeapOutput.output.address,
      prevout: airLeapOutput.outpoint,
      script: AirContractData.code
    },
    {
      address: passport.unspent.output.address,
      prevout: passport.unspent.outpoint
    },
    { address: airCO2Output.output.address, prevout: airCO2Output.outpoint },
    ...goellarOutpoints
  ];

  return await airContract.methods
    .plantTree(
      goellars.toString(),
      COUNTRY_TO_ADDR[passport.unspent.output.color],
      passport.unspent.output.value,
      EarthContractData.address
    )
    .send(inputs, privateKey);
}
