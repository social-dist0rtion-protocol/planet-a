import { Tx } from "leap-core";

const EarthContractData = require("./contracts/Earth.json");

export default function process(web3, passports, tx) {
  const myAddress = passports[0].unspent.output.address;
  const trade4ByteSignature = web3.eth.abi
    .encodeFunctionSignature(
      EarthContractData.abi.filter(({ name }) => name === "trade")[0]
    )
    .replace("0x", "");

  if (tx.from.toLowerCase() !== EarthContractData.address) {
    return;
  }

  const plasmaTx = Tx.fromRaw(tx.raw);
  const isHandshake =
    plasmaTx.inputs.filter(
      ({ msgData }) =>
        msgData && msgData.toString("hex").startsWith(trade4ByteSignature)
    ).length > 0;

  if (!isHandshake) {
    return;
  }

  const isMe =
    plasmaTx.outputs.filter(({ address }) => address === myAddress).length > 0;

  if (!isMe) {
    return;
  }

  console.log("this is about me", plasmaTx);
}
