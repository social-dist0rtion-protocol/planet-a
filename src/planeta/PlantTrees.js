import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import i18n from "../i18n";
import { Flex, Box, Heading, Text } from "rimble-ui";
import { startHandshake } from "./utils";
import HandshakeButtons from "./HandshakeButtons";
import { getStoredValue } from "../services/localStorage";
import { BorderButton } from "../components/Buttons";
import { plantTrees } from "./utils";

export default class PlantTrees extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handlePlantTrees = this.handlePlantTrees.bind(this);
  }

  async handlePlantTrees(amount) {
    const {
      plasma,
      defaultPassport,
      scannerState,
      metaAccount,
      setReceipt,
      changeView
    } = this.props;
    let result;

    console.log("lock CO₂ for", amount, "Göllars");
    try {
      result = await plantTrees(
        plasma,
        defaultPassport,
        amount,
        metaAccount.privateKey
      );
    } catch (err) {
      setReceipt({ type: "error", message: err.toString() });
      changeView("receipt");
      return;
    }
    setReceipt({
      type: "plant",
      txHash: result,
      amount
    });
    changeView("receipt");
  }

  render() {
    const { changeAlert, goBack } = this.props;
    const { receipt } = this.state;

    return (
      <Flex flexDirection="column">
        <div>
          <Heading.h5>Plant some trees</Heading.h5>
          <Text fontSize={1}>Remove CO₂ from the atmosphere.</Text>
          <BorderButton
            mt={2}
            fullWidth
            onClick={() => this.handlePlantTrees(1)}
          >
            Invest 1 Göllars to remove 1 Gigaton of CO₂
          </BorderButton>
          <hr />
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
      </Flex>
    );
  }
}
