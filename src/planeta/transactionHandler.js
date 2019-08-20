import { Tx, Util } from "leap-core";
import JSBI from "jsbi";
import { BigInt } from "jsbi-utils";
import getConfig from "../config";
import { addHandshake } from "./cooldown";

const CONFIG = getConfig();
const GOELLAR_COLOR = 3;
const BITMASK_CO2 = BigInt("0xffffffff");
const BITMASK_CO2_LOCKED = JSBI.leftShift(BITMASK_CO2, BigInt(32));
const EarthContractData = require("./contracts/Earth.json");

function parseHandshake(myAddress, inputs, outputs) {
  const theirAddress = inputs.filter(
    input => Util.isNST(input.color) && input.address !== myAddress
  )[0].address;

  // Filtering functions
  const isOwner = owner => ({ address }) => owner === address;
  const isMine = isOwner(myAddress);
  const isTheirs = isOwner(theirAddress);
  const isPassport = ({ color }) => Util.isNST(color);
  const isGoellar = ({ color }) => color === GOELLAR_COLOR;

  // Masking functions
  const mask = bitmask => data => JSBI.bitwiseAnd(BigInt(data), bitmask);
  const bitmaskCO2 = mask(BITMASK_CO2);
  const bitmaskCO2Locked = mask(BITMASK_CO2_LOCKED);

  // Defect detection
  const getDefectInInputs = address => {
    const defect = inputs.filter(isOwner(address)).filter(isGoellar);
    return defect.length > 0 ? BigInt(defect[0].value) : BigInt(0);
  };
  const getDefectInPassport = (dataBefore, dataAfter) =>
    JSBI.subtract(bitmaskCO2Locked(dataAfter), bitmaskCO2Locked(dataBefore));
  const isDefect = (address, dataBefore, dataAfter) =>
    JSBI.greaterThan(
      JSBI.add(
        getDefectInPassport(dataBefore, dataAfter),
        getDefectInInputs(address, inputs)
      ),
      BigInt(0)
    );

  // Emissions and gains functions
  const getCO2 = (dataBefore, dataAfter) =>
    JSBI.toNumber(
      JSBI.subtract(bitmaskCO2(dataAfter), bitmaskCO2(dataBefore))
    );
  const getGoellars = address =>
    // FIXME: dividing to 1e14 to get an int, the dividing by 10000 to get the
    // float...
    JSBI.toNumber(
      JSBI.divide(
        JSBI.subtract(
          BigInt(outputs.filter(isOwner(address)).filter(isGoellar)[0].value),
          getDefectInInputs(address)
        ),
        BigInt("100000000000000")
      )
    ) / 10000;

  const myPassport = BigInt(
    inputs.filter(isMine).filter(isPassport)[0].value
  ).toString();
  const theirPassport = BigInt(
    inputs.filter(isTheirs).filter(isPassport)[0].value
  ).toString();
  const myDataBefore = inputs.filter(isMine).filter(isPassport)[0].data;
  const myDataAfter = outputs.filter(isMine).filter(isPassport)[0].data;
  const theirDataBefore = inputs.filter(isTheirs).filter(isPassport)[0].data;
  const theirDataAfter = outputs.filter(isTheirs).filter(isPassport)[0].data;

  return {
    myAddress,
    myDefect: isDefect(myAddress, myDataBefore, myDataAfter),
    myGoellars: getGoellars(myAddress),
    myCO2: getCO2(myDataBefore, myDataAfter),
    myPassport,
    theirAddress,
    theirCO2: getCO2(theirDataBefore, theirDataAfter),
    theirDefect: isDefect(theirAddress, theirDataBefore, theirDataAfter),
    theirGoellars: getGoellars(theirAddress),
    theirPassport
  };
}

export default async function process(plasma, passports, tx) {
  const myAddress = passports[0].unspent.output.address;
  const trade4ByteSignature = plasma.eth.abi
    .encodeFunctionSignature(
      EarthContractData.abi.filter(({ name }) => name === "trade")[0]
    )
    .replace("0x", "");
  if (tx.from.toLowerCase() !== EarthContractData.address) {
    return;
  }
  const plasmaTx = Tx.fromRaw(tx.raw);
  const outputs = plasmaTx.outputs;
  const isHandshake =
    plasmaTx.inputs.filter(
      ({ msgData }) =>
        msgData && msgData.toString("hex").startsWith(trade4ByteSignature)
    ).length > 0;
  if (!isHandshake) {
    return;
  }
  const isMe =
    outputs.filter(({ address }) => address === myAddress).length > 0;
  if (!isMe) {
    return;
  }
  console.log("Transaction about me", tx);
  const inputs = await Promise.all(
    plasmaTx.inputs.map(({ prevout: { index, hash } }) =>
      plasma.eth
        .getTransaction("0x" + hash.toString("hex"))
        .then(({ raw }) => Tx.fromRaw(raw).outputs[index])
    )
  );
  const result = parseHandshake(myAddress, inputs, outputs);
  result.txHash = tx.hash;
  console.log("handshake values", result);
  console.log("handshake", `${CONFIG.SIDECHAIN.EXPLORER.URL}tx/${result.txHash}`);
  addHandshake(result.myPassport, result.theirPassport);
  return result;
}
