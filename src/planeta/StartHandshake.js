import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import getConfig from "../config";
import i18n from "../i18n";
import { Text, Flex, Box, QR as QRCode } from "rimble-ui";
import { startHandshake } from "./utils";

const CONFIG = getConfig();

export default class Handshake extends React.Component {
  render() {
    const {
      changeView,
      changeAlert,
      goBack,
      metaAccount,
      plasma,
      defaultPassport: passport
    } = this.props;

    const country = passport.country.fullName;
    const name = passport.data.name;

    const receipt = startHandshake(passport.unspent, metaAccount.privateKey);
    const url = "/planeta/handshake/" + receipt;
    return (
      <div>
        <div>
          <Flex flexDirection="column" mb={3}>
            <Text fontSize={2} textAlign="center">
              You as <strong>{name}</strong>, {`Citizen of the ${country}`}, are
              starting a handshake.
            </Text>
          </Flex>

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
          <Text fontSize={1} textAlign="center">
            By allowing another citizen to scan this QRCode, you agree to
            handshake with them.
          </Text>
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
