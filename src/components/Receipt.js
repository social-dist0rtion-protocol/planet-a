// @format
import React, { Component } from "react";
import TxReceipt from "./TxReceipt";
import TradeReceipt from "./TradeReceipt";
import PassportReceipt from "./PassportReceipt";
import ErrorReceipt from "./ErrorReceipt";

export default class Receipt extends Component {
  render() {
    const {
      receipt: { type }
    } = this.props;

    if (type === "trade") {
      return <TradeReceipt {...this.props} />;
    } else if (type === "error") {
      return <ErrorReceipt {...this.props} />;
    } else if (type === "plant") {
      // TODO: Implement tree receipt
      console.log("display a plant");
    } else if (type === "passport_transfer") {
      return <PassportReceipt {...this.props} />;
    } else {
      return <TxReceipt {...this.props} />;
    }
  }
}
