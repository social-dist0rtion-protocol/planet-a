// @format
import React, { Component } from "react";
import TxReceipt from "./TxReceipt";
import TradeReceipt from "./TradeReceipt";
import PlantReceipt from "../planeta/PlantReceipt";
import PassportReceipt from "./PassportReceipt";

export default class Receipt extends Component {
  render() {
    const {
      receipt: { type }
    } = this.props;

    if (type === "trade") {
      return <TradeReceipt {...this.props} />;
    } else if (type === "error") {
      // TODO: Display funny error
      // NOTE: Alberto told me that Earth can run out of Goellars or CO2 so
      // we should annoy the shit out of him when an error occurs
      console.log("display an error");
    } else if (type === "plant") {
      return <PlantReceipt {...this.props} />;
    } else if (type === "passport_transfer") {
      return <PassportReceipt {...this.props} />;
    } else {
      return <TxReceipt {...this.props} />;
    }
  }
}
