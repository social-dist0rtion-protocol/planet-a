//@format
import React from "react";
import { PrimaryButton } from "../components/Buttons";
import { Text, Flex, Box } from "rimble-ui";
import { finalizeHandshake } from "./utils";

export default class FinalizeHandshake extends React.Component {
  constructor(props) {
    super(props);
  }

  send = async () => {
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
        metaAccount.privateKey
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
  };

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
      <div>
        <Flex flexDirection="column" mb={3}>
          <Text fontSize={2} textAlign="center">
            You as <strong>{name}</strong>, {`Citizen of the ${country}`}, are
            finalizing a handshake.
          </Text>
        </Flex>

        <PrimaryButton
          size={"large"}
          width={1}
          disabled={!passport}
          onClick={this.send}
        >
          Handshake now!
        </PrimaryButton>
        <Text mt={3} fontSize={1} textAlign="center">
          By confirming this action, you agree to finalize the handshake with
          another citizen.
        </Text>
      </div>
    );
  }
}
