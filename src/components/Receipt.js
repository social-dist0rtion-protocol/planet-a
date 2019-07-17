// @format
import React, { Component } from "react";
import TxReceipt from "./TxReceipt";
import TradeReceipt from "./TradeReceipt";

export default class Receipt extends Component {
  render() {
    const {
      receipt: { type }
    } = this.props;

    if (type === "trade") {
      return <TradeReceipt {...this.props} />;
    } else if (type === "plant") {
      // TODO: Implement tree receipt
    } else {
      return <TxReceipt {...this.props} />;
    }
  }
}
