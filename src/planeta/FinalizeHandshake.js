//@format
import React from "react";
import { finalizeHandshake } from "./utils";
import HandshakeButtons from "./HandshakeButtons";
import { getStoredValue } from "../services/localStorage";

export default class FinalizeHandshake extends React.Component {
  constructor(props) {
    super(props);
    this.handleStrategy = this.handleStrategy.bind(this);
  }

  async handleStrategy(strategy) {
    if (getStoredValue("expertMode") === "true") {
      strategy = strategy === "collaborate" ? "defect" : "collaborate";
    }
    const {
      plasma,
      defaultPassport,
      scannerState,
      metaAccount,
      setReceipt,
      changeView
    } = this.props;
    changeView("loader");

    let finalReceipt;
    try {
      finalReceipt = await finalizeHandshake(
        plasma,
        defaultPassport.unspent,
        scannerState.receipt,
        metaAccount.privateKey,
        strategy
      );
    } catch (err) {
      setReceipt({ type: "error" });
      return;
    }
  }

  componentDidMount() {
    const { goBack, changeAlert, defaultPassport: passport } = this.props;

    if (!passport) {
      // Sorry.
      goBack();
      setTimeout(
        () => changeAlert({ type: "warning", message: "Select a passport" }),
        100
      );
    }
  }

  render() {
    const { defaultPassport: passport } = this.props;

    if (!passport) {
      return null;
    }

    return <HandshakeButtons handleStrategy={this.handleStrategy} />;
  }
}
