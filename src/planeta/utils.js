/**
 * Passport data structure

+------------+------------+------------+-------------+
|20 bytes    | 4 bytes    | 4 bytes    | 4 bytes     |
|name str    | picId      | CO2 locked | CO2 emitted |
+------------+------------+------------+-------------+

*/

import Web3 from "web3";
import { bytesToHex, padLeft } from "web3-utils";
import { ecsign, hashPersonalMessage, ripemd160 } from "ethereumjs-util";
import { PlasmaContract } from "./plasma-utils";

const EarthContractData = require("./contracts/Earth.json");
EarthContractData.code = Buffer.from(EarthContractData.code.replace("0x", ""), "hex");

const BN = Web3.utils.BN;

const USA_ADDR = "0x3378420181474D3aad9579907995011D6a545E3D";
const USB_ADDR = "0x181fc600915c35F4e44d41f9203A7c389b4A7189";

const USA_COLOR = 49156;
const USB_COLOR = 49155;
const COUNTRY_TO_ADDR = {
  "49156": USA_ADDR,
  "49155": USB_ADDR
};
const LEAP_COLOR = 0;
const CO2_COLOR = 2;
const GOELLARS_COLOR = 3;

function updateCO2(passportData, amount) {
  const n = new BN(passportData.replace("0x", ""), 16);
  n.iadd(new BN(amount));
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

export async function startHandshake(web3, passport, privateKey) {
  const passportDataAfter = updateCO2(passport.output.data, "8");

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

export async function finalizeHandshake(plasma, passport, receipt, privateKey) {
  const theirPassport = unpackReceipt(receipt);
  const theirPassportOutput = await findPassportOutput(
    plasma,
    theirPassport.address,
    theirPassport.color,
    theirPassport.value
  );

  const earthLeapOutput = (await plasma.getUnspent(EarthContractData.address, LEAP_COLOR))[0];
  const earthCO2Output = (await plasma.getUnspent(EarthContractData.address, CO2_COLOR))[0];
  const earthGoellarsOutput = (await plasma.getUnspent(
    EarthContractData.address,
    GOELLARS_COLOR
  ))[0];
  console.log(EarthContractData, earthLeapOutput, earthCO2Output, earthGoellarsOutput);

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
    .send(
      [
        { prevout: earthLeapOutput.outpoint, script: EarthContractData.code },
        { prevout: earthCO2Output.outpoint },
        { prevout: earthGoellarsOutput.outpoint },
        { prevout: theirPassportOutput.outpoint },
        { prevout: passport.outpoint }
      ],
      privateKey
    );
}
