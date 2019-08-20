import * as ethUtils from "ethereumjs-util";
import { Tx, Input, Output } from "leap-core";
import { BN } from "web3-utils";

export async function consolidateUTXOs(utxos, plasma, web3, privateKey) {
  const { address, color } = utxos[0].output;
  const inputs = utxos.map(({ outpoint }) => new Input(outpoint));
  const amount = utxos
    .reduce((acc, { output: { value } }) => acc.iadd(new BN(value)), new BN(0))
    .toString(10);
  const outputs = [new Output(amount, address.toLowerCase(), color)];
  const transaction = Tx.transfer(inputs, outputs);

  const signedTx = privateKey
    ? await transaction.signAll(privateKey)
    : await transaction.signWeb3(web3);

  try {
    return await plasma.eth.sendSignedTransaction(signedTx.hex());
  } catch (e) {
    throw new Error("Cannot send transaction.");
  }
}

function signMatching(transaction, privateKey) {
  const address = ethUtils.bufferToHex(ethUtils.privateToAddress(privateKey));
  const privateKeyBuffer = Buffer.from(privateKey.replace("0x", ""), "hex");
  for (let input of transaction.inputs) {
    if (address === input.address) {
      const sigHashBuf = ethUtils.hashPersonalMessage(transaction.sigDataBuf());
      const sig = ethUtils.ecsign(sigHashBuf, privateKeyBuffer);
      input.setSig(sig.r, sig.s, sig.v, address);
    }
  }
  return transaction;
}

class PlasmaMethodCall {
  constructor(plasma, data) {
    this.plasma = plasma;
    this.data = data;
  }

  async send(inputs, privateKey) {
    let transaction = Tx.spendCond(
      inputs.map(input => {
        const i = new Input(input);
        i.address = input.address;
        return i;
      })
    );
    transaction.inputs[0].setMsgData(this.data);
    transaction = signMatching(transaction, privateKey);

    const { outputs } = await new Promise((resolve, reject) => {
      this.plasma.currentProvider.send(
        {
          jsonrpc: "2.0",
          id: 42,
          method: "checkSpendingCondition",
          params: [transaction.hex()]
        },
        (err, response) => {
          console.log("checkSpendingCondition", err, response);
          if (err) {
            return reject(err);
          }
          return resolve(response.result);
        }
      );
    });
    transaction.inputs[0].setMsgData(this.data);
    transaction.outputs = outputs.map(o => new Output(o));

    transaction = signMatching(transaction, privateKey);

    const signedTx = signMatching(transaction, privateKey);
    try {
      return await this.plasma.eth.sendSignedTransaction(signedTx.hex());
    } catch (e) {
      throw new Error("Cannot send transaction.");
    }
  }
}

export class PlasmaContract {
  constructor(plasma, abi) {
    this.plasma = plasma;
    this.abi = abi;
    this.contract = new plasma.eth.Contract(abi);
    this.methods = {};
    abi
      .filter(o => o.type === "function")
      .forEach(
        ({ name }) => (this.methods[name] = this.methodCall.bind(this, name))
      );
  }

  methodCall(method, ...params) {
    const data = this.contract.methods[method](...params).encodeABI();
    return new PlasmaMethodCall(this.plasma, data);
  }
}
