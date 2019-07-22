import { Tx, Input, Output } from "leap-core";

class LeapMethodCall {
  constructor(leap3, data) {
    this.leap3 = leap3;
    this.data = data;
  }

  async send(inputs, privateKey) {
    const conditions = Tx.spendCond(inputs.map(o => new Input(o)));
    conditions.inputs[0].setMsgData(this.data);

    const { outputs } = await new Promise((resolve, reject) => {
      this.leap3.currentProvider.send(
        {
          jsonrpc: "2.0",
          id: 42,
          method: "checkSpendingCondition",
          params: [conditions.hex()]
        },
        (err, response) => {
          if (err) {
            return reject(err);
          }
          return resolve(response.result);
        }
      );
    });
    conditions.inputs[0].setMsgData(this.data);
    conditions.outputs = outputs.map(o => new Output(o));
    conditions.signAll(privateKey);
    const result = await new Promise((resolve, reject) => {
      this.leap3.currentProvider.send(
        {
          jsonrpc: "2.0",
          id: 42,
          method: "eth_sendRawTransaction",
          params: [conditions.hex()]
        },
        (err, { result }) => {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        }
      );
    });
    return result;
  }
}

export class LeapContract {
  constructor(leap3, abi) {
    this.leap3 = leap3;
    this.abi = abi;
    this.contract = new leap3.eth.Contract(abi);
    this.methods = {};
    abi
      .filter(o => o.type === "function")
      .forEach(
        ({ name }) => (this.methods[name] = this.methodCall.bind(this, name))
      );
  }

  methodCall(method, ...params) {
    const data = this.contract.methods[method](...params).encodeABI();
    return new LeapMethodCall(this.leap3, data);
  }
}
