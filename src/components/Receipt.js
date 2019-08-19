// @format
import React, { Component } from "react";
import TxReceipt from "./TxReceipt";
import TradeReceipt from "./TradeReceipt";
import PlantReceipt from "../planeta/PlantReceipt";
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
      return <PlantReceipt {...this.props} />;
    } else if (type === "passport_transfer") {
      return <PassportReceipt {...this.props} />;
    } else {
      return <TxReceipt {...this.props} />;
    }
  }
}
