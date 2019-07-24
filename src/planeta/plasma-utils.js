import { Tx, Input, Output } from "leap-core";

class PlasmaMethodCall {
  constructor(plasma, data) {
    this.plasma = plasma;
    this.data = data;
  }

  async send(inputs, privateKey) {
    const condition = Tx.spendCond(
      inputs.map(o => (o instanceof Input ? o : new Input(o)))
    );
    condition.inputs[0].setMsgData(this.data);
    console.log(condition.inputs);

    // condition should be signed but:
    // https://github.com/leapdao/leap-node/issues/298
    // ¯\_(ツ)_/¯

    condition.signAll(privateKey);
    // condition.sign([null, privateKey, null, privateKey]);
    const { outputs } = await new Promise((resolve, reject) => {
      this.plasma.currentProvider.send(
        {
          jsonrpc: "2.0",
          id: 42,
          method: "checkSpendingCondition",
          params: [condition.hex()]
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
    condition.inputs[0].setMsgData(this.data);
    condition.outputs = outputs.map(o => new Output(o));
    condition.signAll(privateKey);
    const result = await new Promise((resolve, reject) => {
      this.plasma.currentProvider.send(
        {
          jsonrpc: "2.0",
          id: 42,
          method: "eth_sendRawTransaction",
          params: [condition.hex()]
        },
        (err, response) => {
          console.log("sendRawTransaction", err, response);
          if (err) {
            return reject(err);
          }
          return resolve(response.result);
        }
      );
    });
    return result;
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
