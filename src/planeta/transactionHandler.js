import { Tx, Util } from "leap-core";
import JSBI from "jsbi";
import { BigInt } from "jsbi-utils";

const GOELLAR_COLOR = 3;
const BITMASK_CO2 = JSBI.subtract(
  JSBI.leftShift(BigInt(1), BigInt(32)),
  BigInt(1)
);

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
    return defect.length > 0 ? defect[0].value : BigInt(0);
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
    ) / 1000;
  const getGoellars = address =>
    // FIXME: dividing to 1e16 to get an int, the dividing by 100 to get the
    // float...
    JSBI.toNumber(
      JSBI.divide(
        JSBI.subtract(
          BigInt(outputs.filter(isOwner(address)).filter(isGoellar)[0].value),
          getDefectInInputs(address)
        ),
        BigInt("10000000000000000")
      )
    ) / 100;

  const myDataBefore = inputs.filter(isMine).filter(isPassport)[0].data;
  const myDataAfter = outputs.filter(isMine).filter(isPassport)[0].data;
  const theirDataBefore = inputs.filter(isTheirs).filter(isPassport)[0].data;
  const theirDataAfter = outputs.filter(isTheirs).filter(isPassport)[0].data;

  return {
    myCO2: getCO2(myDataBefore, myDataAfter),
    theirCO2: getCO2(theirDataBefore, theirDataAfter),
    myGoellars: getGoellars(myAddress),
    theirGoellars: getGoellars(theirAddress),
    myDefect: isDefect(myAddress, myDataBefore, myDataAfter),
    theirDefect: isDefect(theirAddress, theirDataBefore, theirDataAfter)
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
  const inputs = await Promise.all(
    plasmaTx.inputs.map(({ prevout: { index, hash } }) =>
      plasma.eth
        .getTransaction("0x" + hash.toString("hex"))
        .then(({ raw }) => Tx.fromRaw(raw).outputs[index])
    )
  );
  for (let input of inputs) {
    input.value = BigInt(input.value);
  }
  for (let output of outputs) {
    output.value = BigInt(output.value);
  }
  const result = parseHandshake(myAddress, inputs, outputs);
  console.log(result);
}
