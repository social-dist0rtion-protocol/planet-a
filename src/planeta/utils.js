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
import { LeapContract } from "./leap-utils";

const EARTH_ABI = require("./abis/earth.json");

const BN = Web3.utils.BN;
const SCRIPT = Buffer.from(
  "608060405234801561001057600080fd5b506004361061002e5760e060020a60003504637f565aab8114610033575b600080fd5b610106600480360360e081101561004957600080fd5b813591602081013591810190606081016040820135602060020a81111561006f57600080fd5b82018360208201111561008157600080fd5b803590602001918460018302840111602060020a831117156100a257600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092955050823593505050602081013563ffffffff16906040810135600160a060020a03908116916060013516610108565b005b6000829050600081600160a060020a03166337ebbc038a6040518263ffffffff1660e060020a0281526004018082815260200191505060206040518083038186803b15801561015657600080fd5b505afa15801561016a573d6000803e3d6000fd5b505050506040513d602081101561018057600080fd5b50516040805160e160020a6331a9108f028152600481018c90529051919250828a0391731f89fb2199220a350287b162b9d0a330a2d2efad91829163a9059cbb91600160a060020a03881691636352211e91602480820192602092909190829003018186803b1580156101f257600080fd5b505afa158015610206573d6000803e3d6000fd5b505050506040513d602081101561021c57600080fd5b50516040805163ffffffff84811660e060020a028252600160a060020a039093166004820152918b1660248301525160448083019260209291908290030181600087803b15801561026c57600080fd5b505af1158015610280573d6000803e3d6000fd5b505050506040513d602081101561029657600080fd5b50506040805160e160020a6331a9108f028152600481018a905290518691600160a060020a038085169263a9059cbb9291851691636352211e916024808301926020929190829003018186803b1580156102ef57600080fd5b505afa158015610303573d6000803e3d6000fd5b505050506040513d602081101561031957600080fd5b50516040805163ffffffff84811660e060020a028252600160a060020a039093166004820152918c1660248301525160448083019260209291908290030181600087803b15801561036957600080fd5b505af115801561037d573d6000803e3d6000fd5b505050506040513d602081101561039357600080fd5b81019080805190602001909291905050505084600160a060020a03166336c9c4578d8d8d6040518463ffffffff1660e060020a0281526004018084815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156104125781810151838201526020016103fa565b50505050905090810190601f16801561043f5780820380516001836020036101000a031916815260200191505b50945050505050600060405180830381600087803b15801561046057600080fd5b505af1158015610474573d6000803e3d6000fd5b50505050600081600160a060020a03166337ebbc038b6040518263ffffffff1660e060020a0281526004018082815260200191505060206040518083038186803b1580156104c157600080fd5b505afa1580156104d5573d6000803e3d6000fd5b505050506040513d60208110156104eb57600080fd5b50516040805160e060020a63a983d43f028152600481018d905263ffffffff8c16830160248201529051919250600160a060020a0384169163a983d43f9160448082019260009290919082900301818387803b15801561054a57600080fd5b505af115801561055e573d6000803e3d6000fd5b50506040805160e060020a63a9059cbb028152738db6B632D743aef641146DC943acb64957155388600482015263ffffffff8d166024820152905173f64ffbc4a69631d327590f4151b79816a193a8c6935083925063a9059cbb916044808201926020929091908290030181600087803b1580156105db57600080fd5b505af11580156105ef573d6000803e3d6000fd5b505050506040513d602081101561060557600080fd5b5050505050505050505050505050505056fea165627a7a7230582040b4d4c325ac3d46db172e483ff415735a15bc2356a30fbc65bf9b92d06fdc5a0029",
  "hex"
);
const EARTH_ADDR = "0x" + ripemd160(SCRIPT).toString("hex");
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

function updateCO2(passportData, amount = 10) {
  const n = new BN(passportData.replace("0x", ""), 16);
  n.iadd(new BN(amount));
  return padLeft(n.toString(16), 64);
}

function hashAndSign(buffer, address, privateKey) {
  const { r, s, v } = ecsign(
    hashPersonalMessage(buffer),
    Buffer.from(privateKey.replace("0x", ""), "hex")
  );
  const full = Array.from(r)
    .concat(Array.from(s))
    .concat([v]);
  return bytesToHex(full);

  // Web3:
  //return await web3.eth.personal.sign(buffer.toString(), address, null);
}

function unpackReceipt(receipt) {
  const [address, color, value, data, signature] = receipt.split(";");
  return { address, color, value, data, signature };
}

async function findPassportOutput(leap3, address, color, value) {
  const passports = await leap3.getUnspent(address, color);
  return passports.filter(p => p.output.value === value)[0];
}

export function startHandshake(passport, privateKey) {
  const passportDataAfter = updateCO2(passport.output.data);

  const signature = hashAndSign(
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

export async function finalizeHandshake(leap3, passport, receipt, privateKey) {
  const theirPassport = unpackReceipt(receipt);
  const theirPassportOutput = await findPassportOutput(
    leap3,
    theirPassport.address,
    theirPassport.color,
    theirPassport.value
  );
  const earthLeapOutput = (await leap3.getUnspent(EARTH_ADDR, LEAP_COLOR))[0];
  const earthCO2Output = (await leap3.getUnspent(EARTH_ADDR, CO2_COLOR))[0];
  const earthGoellarsOutput = (await leap3.getUnspent(
    EARTH_ADDR,
    GOELLARS_COLOR
  ))[0];

  const earthContract = new LeapContract(leap3, EARTH_ABI);
  return await earthContract.methods
    .trade(
      theirPassport.value,
      "0x" + theirPassport.data,
      theirPassport.signature,
      passport.output.value,
      10,
      COUNTRY_TO_ADDR[theirPassport.color],
      COUNTRY_TO_ADDR[passport.output.color]
    )
    .send(
      [
        { prevout: earthLeapOutput.outpoint, script: SCRIPT },
        { prevout: earthCO2Output.outpoint },
        { prevout: earthGoellarsOutput.outpoint },
        { prevout: theirPassportOutput.outpoint },
        { prevout: passport.outpoint }
      ],
      privateKey
    );
}
