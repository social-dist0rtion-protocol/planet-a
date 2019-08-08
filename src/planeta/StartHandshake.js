import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import getConfig from "../config";
import i18n from "../i18n";
import { Text, Flex, Icon, Box, Heading, QR as QRCode } from "rimble-ui";
import { startHandshake } from "./utils";
import { PrimaryButton, BorderButton } from "../components/Buttons";
import HandshakeButtons from "./HandshakeButtons";
import { getStoredValue } from "../services/localStorage";

const CONFIG = getConfig();

function renderReceipt(receipt, changeAlert) {
  const url = "/planeta/handshake/" + receipt;
  return (
    <>
      <Heading.h5>
        Ask another person to scan this QRCode to handshake with you!
      </Heading.h5>

      <CopyToClipboard
        text={url}
        onCopy={() => {
          changeAlert({
            type: "success",
            message: i18n.t("receive.address_copied")
          });
        }}
      >
        <Box>
          <Flex
            flexDirection={"column"}
            alignItems={"center"}
            p={3}
            border={1}
            borderColor={"grey"}
            borderRadius={1}
          >
            <QRCode className="qr-code" value={url} renderAs={"svg"} />
          </Flex>
        </Box>
      </CopyToClipboard>
    </>
  );
}

export default class Handshake extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleStrategy = this.handleStrategy.bind(this);
  }

  async handleStrategy(strategy) {
    if(getStoredValue("expertMode") === "true") {
      strategy = strategy === "collaborate" ? "defect" : "collaborate";
    }
    const { metaAccount, plasma, web3, defaultPassport: passport } = this.props;
    const country = passport.country.fullName;
    const name = passport.data.name;
    const receipt = await startHandshake(
      web3,
      passport.unspent,
      metaAccount.privateKey,
      strategy
    );
    this.setState({ receipt });
  }

  render() {
    const {
      changeView,
      changeAlert,
      goBack,
      metaAccount,
      plasma,
      defaultPassport: passport
    } = this.props;
    const { receipt } = this.state;
    const country = passport.country.fullName;
    const name = passport.data.name;

    return (
      <div>
        <div>
          {receipt ? (
            renderReceipt(receipt, changeAlert)
          ) : (
            <HandshakeButtons handleStrategy={this.handleStrategy} />
          )}
        </div>
        <div name="theVeryBottom" className="text-center bottom-text">
          <span style={{ padding: 10 }}>
            <a
              href="#"
              style={{ color: "#FFFFFF" }}
              onClick={() => {
                goBack();
              }}
            >
              <i className="fas fa-times" /> {i18n.t("cancel")}
            </a>
          </span>
        </div>
      </div>
    );
  }
}
