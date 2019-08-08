//@format
import React from "react";
import { PrimaryButton } from "../components/Buttons";
import { Text, Flex, Box } from "rimble-ui";
import { finalizeHandshake } from "./utils";
import HandshakeButtons from "./HandshakeButtons";
import { getStoredValue } from "../services/localStorage";

export default class FinalizeHandshake extends React.Component {
  constructor(props) {
    super(props);
    this.handleStrategy = this.handleStrategy.bind(this);
  }

  async handleStrategy(strategy) {
    if(getStoredValue("expertMode") === "true") {
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

    setReceipt(
      // NOTE: Receipt needs to be of type "trade" for correct receipt to be
      // displayed. "profit" and "emission" needs to be included.
      Object.assign(finalReceipt, {
        type: "trade",
        profit: 0.2,
        emission: 8
      })
    );
    changeView("receipt");
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
    const {
      changeAlert,
      goBack,
      metaAccount,
      web3,
      plasma,
      defaultPassport: passport
    } = this.props;

    if (!passport) {
      return null;
    }

    const { receipt } = this.props.scannerState;
    const country = passport.country.fullName;
    const name = passport.data.name;

    return (
      <HandshakeButtons handleStrategy={this.handleStrategy} />
    );
  }
}
