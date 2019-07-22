import React from "react";
import { PrimaryButton } from "../components/Buttons";
import { Text, Flex, Box } from "rimble-ui";
import { finalizeHandshake } from "./utils";

export default class FinalizeHandshake extends React.Component {
  send = async () => {
    const result = await finalizeHandshake(
      this.props.plasma,
      this.props.defaultPassport.unspent,
      this.props.scannerState.receipt,
      this.props.metaAccount.privateKey
    );
    console.log("Finalize handshake", result);
  };

  componentDidMount() {
    const {
      goBack,
      changeAlert,
      defaultPassport: passport
    } = this.props;

    if (!passport) {
      // Sorry.
      goBack()
      setTimeout(() => changeAlert({ type: "warning", message: "Select a passport" }), 100);
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
