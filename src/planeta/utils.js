/**
 * Passport data structure

+------------+------------+------------+-------------+
|20 bytes    | 4 bytes    | 4 bytes    | 4 bytes     |
|name str    | picId      | CO2 locked | CO2 emitted |
+------------+------------+------------+-------------+

*/

import Web3 from "web3";
import { bytesToHex, padLeft } from "web3-utils";
import { ecsign, hashPersonalMessage } from "ethereumjs-util";
import { PlasmaContract } from "./plasma-utils";
import { timeLeft } from "./cooldown";

const EarthContractData = require("./contracts/Earth.json");
EarthContractData.code = Buffer.from(
  EarthContractData.code.replace("0x", ""),
  "hex"
);

const BN = Web3.utils.BN;
const factor18 = new BN("1000000000000000000");

const USA_ADDR = "0x3378420181474D3aad9579907995011D6a545E3D";
const USB_ADDR = "0x181fc600915c35F4e44d41f9203A7c389b4A7189";

const COUNTRY_TO_ADDR = {
  "49156": USA_ADDR,
  "49155": USB_ADDR
};
const LEAP_COLOR = 0;
const CO2_COLOR = 2;
const GOELLARS_COLOR = 3;

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
    passportDataAfter = calculateUpdatedCO2(passport.output.data, "400");
  } else if (strategy === "defect") {
    passportDataAfter = calculateUpdatedCO2(passport.output.data, "20000");
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
    txHash = await _finalizeHandshake(
      plasma,
      passport,
      receipt,
      privateKey,
      strategy
    );
  } catch (err) {
    // ignore for now
    console.log("error finalizing handshake", err);
    // NOTE: Leap's node currently doesn't implement the "newBlockHeaders"
    // JSON-RPC call. When a transaction is rejected by a node,
    // sendSignedTransaction hence throws an error. We simply ignore this
    // error here and use the polling tactic below. For more details see:
    // https://github.com/leapdao/leap-node/issues/255

    // const messageToIgnore = "Failed to subscribe to new newBlockHeaders to confirm the transaction receipts.";
    // NOTE: In the case where we want to ignore web3's error message, there's
    // "\r\n {}" included in the error message, which is why we cannot
    // compare with the equal operator, but have to use String.includes.
    // if (!err.message.includes(messageToIgnore)) {
    //  throw err;
    // }
  }

  while (rounds--) {
    // redundancy rules ✊
    let res = await plasma.eth.getTransaction(txHash);

    if (res && res.blockHash) {
      finalReceipt = res;
      break;
    }

    // wait ~100ms
    await new Promise(resolve => setTimeout(() => resolve(), 100));
  }

  if (finalReceipt) {
    return finalReceipt;
  } else {
    throw new Error("Transaction wasn't included into a block.");
  }
}

async function _finalizeHandshake(
  plasma,
  passport,
  receipt,
  privateKey,
  strategy
) {
  const gt = lower => o =>
    new BN(o.output.value).gt(new BN(lower).mul(factor18));
  // Select a random element from a list, see below for usage
  const theirPassport = unpackReceipt(receipt);
  const theirPassportOutput = await findPassportOutput(
    plasma,
    theirPassport.address,
    theirPassport.color,
    theirPassport.value
  );

  // TODO: remove filters.
  const earthLeapOutput = choice(
    await plasma.getUnspent(EarthContractData.address, LEAP_COLOR)
  );
  const earthCO2Output = choice(
    (await plasma.getUnspent(EarthContractData.address, CO2_COLOR)).filter(
      gt("20")
    )
  );
  const earthGoellarsOutput = choice(
    (await plasma.getUnspent(EarthContractData.address, GOELLARS_COLOR)).filter(
      gt("1")
    )
  );

  const inputs = [
    { prevout: earthLeapOutput.outpoint, script: EarthContractData.code },
    { prevout: earthCO2Output.outpoint },
    { prevout: earthGoellarsOutput.outpoint },
    { prevout: theirPassportOutput.outpoint },
    { prevout: passport.outpoint }
  ];

  const toSign = [null, null, null, null, privateKey];

  if (strategy === "defect") {
    const myGoellarsOutput = (await plasma.getUnspent(
      passport.output.address,
      GOELLARS_COLOR
    ))[0];
    inputs.push({ prevout: myGoellarsOutput.outpoint });
    toSign.push(privateKey);
  }

  console.log("finalize", strategy, inputs, toSign);

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
    .send(inputs, toSign);
}
