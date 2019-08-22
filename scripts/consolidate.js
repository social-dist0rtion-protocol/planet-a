const { bi, lessThan, add, subtract, multiply } = require("jsbi-utils");
const { bufferToHex, ripemd160, keccak256 } = require("ethereumjs-util");
const ethers = require("ethers");
const LeapProvider = require("leap-provider");
const { Tx, helpers, Input, Output } = require("leap-core");

const erc20ABI = require("../src/contracts/StableCoin.abi");
const earth = require("../src/planeta/contracts/Earth");
const air = require("../src/planeta/contracts/Air");

const { LeapEthers } = helpers;

const CONFIG = {
  color: process.env.COLOR || 0,
  priv: process.env.PRIV_KEY
};

const code = process.env.TYPE === 'air' ? air.code : earth.code; 
const scriptBuf = Buffer.from(code.replace("0x", ""), "hex");
const contractAddress = process.env.CONTRACT_ADDR || bufferToHex(ripemd160(scriptBuf));

const factor18 = bi("1000000000000000000");

const plasma = new LeapEthers(
  new LeapProvider(process.env.NODE_URL || "https://testnet-node.leapdao.org")
);

const GAS_COST = process.env.TYPE === 'air'? bi(7007558) : bi(7001310);

const threshold = {
  1: bi(1), // 1 LEAP
  2: bi(10000), // 20 CO2
  3: bi(10) // 1 GOE
};

const getMsgData = (tx, tokenAddr) => {
  const { v, r, s } = tx.getConditionSig(CONFIG.priv);
  const abi = earth.abi;
  const cons = abi.find(a => a.name === 'consolidate');
  const methodSig = keccak256(
    `${cons.name}(${cons.inputs.map(i => i.type).join(",")})`
  )
    .toString("hex")
    .substr(0, 8);
  const params = ethers.utils.defaultAbiCoder.encode(cons.inputs, [
    tokenAddr,
    v,
    r,
    s
  ]);
  return `0x${methodSig}${params.substring(2)}`;
};

const consolidate = async () => {
  const colors = await plasma.getColors();
  const gasTokenAddress = colors[0];
  const tokenAddr = colors[CONFIG.color];

  console.log("Contract address:", contractAddress);
  console.log("GAS token:", gasTokenAddress, 0);
  console.log("Token to consolidate:", tokenAddr, CONFIG.color);

  const utxos = await plasma.getUnspent(contractAddress, CONFIG.color);
  console.log("UTXOs:", utxos.length);

  let dustUtxos = utxos.filter(u =>
    lessThan(
      bi(u.output.value),
      multiply(threshold[CONFIG.color] || bi(1), factor18)
    )
  );
  dustUtxos = dustUtxos.slice(0, dustUtxos.length > 10 ? 10 : dustUtxos.length);
  console.log("UTXOs to consolidate:", dustUtxos.length);

  const gasToken = new ethers.Contract(
    gasTokenAddress,
    erc20ABI,
    plasma.provider
  );
  const gasBalance = bi(await gasToken.balanceOf(contractAddress));
  if (lessThan(gasBalance, GAS_COST)) {
    throw new Error(
      `Not enough gas for consolidationg. Need: ${GAS_COST}, balance: ${gasBalance}`
    );
  }
  const gasUtxos = await plasma.getUnspent(contractAddress, 0);

  const tokenInputs = dustUtxos.map(u => {
    return new Input({ prevout: u.outpoint });
  });

  const inputs = [
    new Input({ prevout: gasUtxos[0].outpoint, script: scriptBuf }),
    ...tokenInputs
  ];

  const amount = dustUtxos.reduce((a, v) => add(a, bi(v.output.value)), bi(0));

  const outputs = [
    new Output(amount.toString(), contractAddress, CONFIG.color),
    new Output(
      subtract(bi(gasUtxos[0].output.value), GAS_COST).toString(),
      contractAddress,
      0
    )
  ];

  let condition = Tx.spendCond(inputs, outputs);

  condition.inputs[0].setMsgData(getMsgData(condition, tokenAddr));

  const rsp = await plasma.provider
    .send("checkSpendingCondition", [condition.hex()])
    .then(rsp => {
      if (rsp.error) {
        // flip dat input 🎶 shuffle dat sighash 🎵 shake it, shake it
        condition.inputs = [
          new Input({ prevout: gasUtxos[0].outpoint, script: scriptBuf }),
          ...[...tokenInputs.splice(1), ...tokenInputs]
        ];
        condition.inputs[0].setMsgData(getMsgData(condition, tokenAddr));
        return plasma.provider.send("checkSpendingCondition", [
          condition.hex()
        ]);
      }
      return rsp;
    });
  if (rsp.error) {
    console.error(rsp);
    console.log("🛑");
    process.exit(1);
    return;
  }
  const { transactionHash } = await plasma.provider.sendTransaction(condition).then(tx => tx.wait());
  console.log(`https://testnet.leapdao.org/explorer/tx/${transactionHash}`);
  console.log("✅");
  process.exit(0);
};

consolidate();
