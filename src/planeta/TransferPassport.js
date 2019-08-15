// @format
import React, { Component } from "react";
import { Passports } from "../components/Passports";
import { Box, Field, Input } from "rimble-ui";
import { PrimaryButton, BorderButton } from "../components/Buttons";
import { eraseStoredValue } from "../services/localStorage";

export default class TransferPassport extends Component {
  constructor(props) {
    super(props);

    let toAddress;
    if (props.scannerState) {
      toAddress = props.scannerState.toAddress;
    } else {
      toAddress = "";
    }

    this.state = {
      toAddress,
      canSend: this.canSend.bind(this)
    };
  }

  componentWillReceiveProps(newProps) {
    if (this.props.scannerState !== newProps.scannerState) {
      this.setState({
        ...this.state,
        ...newProps.scannerState
      });
    }
  }

  canSend() {
    const { toAddress } = this.state;
    return toAddress && toAddress.length === 42;
  }

  send = async () => {
    let { toAddress } = this.state;
    let {
      account,
      tokenSendV2,
      metaAccount,
      plasma,
      web3,
      goBack,
      changeAlert,
      setReceipt,
      changeView,
      defaultPassport
    } = this.props;

    if (this.state.canSend) {
      this.props.changeView("loader");
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 60);

      let receipt;
      try {
        receipt = await tokenSendV2(
          account,
          toAddress,
          defaultPassport.id,
          defaultPassport.color,
          plasma,
          web3,
          metaAccount && metaAccount.privateKey
        );
      } catch (err) {
        console.log(err);
        goBack();
        changeAlert({
          type: "warning",
          message: "Couldn't send your passport..."
        });
        return;
      }
      goBack();
      window.history.pushState({}, "", "/");
      setReceipt({
        to: toAddress,
        from: receipt.from,
        type: "passport_transfer",
        passport: defaultPassport,
        result: receipt
      });
      changeView("receipt");
      // NOTE: It's important to erase the currentPassport value in localStorage
      // at this stage, as the UI continously deselects the passport.
      eraseStoredValue("currentPassport", account);
    }
  };

  render() {
    const { passports, account } = this.props;
    const { toAddress, canSend } = this.state;
    return (
      <div>
        <Passports list={passports} account={account} />

        <Box mb={4}>
          <Field mb={3} label="To Address">
            <Input
              width={1}
              type="text"
              placeholder="0x..."
              value={toAddress}
              ref={input => {
                this.addressInput = input;
              }}
              onChange={event =>
                this.updateState("toAddress", event.target.value)
              }
            />
          </Field>

          <BorderButton
            icon={"CenterFocusWeak"}
            mb={4}
            width={1}
            onClick={() => {
              this.props.openScanner({
                view: "send_to_address",
                goBackView: "planet_a_transfer_passport"
              });
            }}
          >
            Scan QR Code
          </BorderButton>
        </Box>
        <p style={{ color: "red" }}>
          Attention: Please only send your passport to trustworthy other
          players! Without one, you'll not be able to participate in the game
          anymore!
        </p>
        <PrimaryButton
          size={"large"}
          width={1}
          disabled={!canSend}
          onClick={this.send}
        >
          Send
        </PrimaryButton>
      </div>
    );
  }
}
