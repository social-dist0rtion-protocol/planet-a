import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import i18n from "../i18n";
import { Flex, Box, Heading, Text } from "rimble-ui";
import { startHandshake } from "./utils";
import HandshakeButtons from "./HandshakeButtons";
import { getStoredValue } from "../services/localStorage";
import { BorderButton } from "../components/Buttons";
import { plantTrees, maxCO2Available, CO2_PER_GOELLAR } from "./utils";

export default class PlantTrees extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handlePlantTrees = this.handlePlantTrees.bind(this);
  }

  async componentDidMount() {
    const maxCO2 = await maxCO2Available(this.props.plasma);
    this.setState({ maxCO2 });
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
    changeView("loader");
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
      amount: amount * CO2_PER_GOELLAR
    });
    changeView("receipt");
  }

  render() {
    const { balance, changeAlert, goBack } = this.props;
    const { receipt, maxCO2 } = this.state;

    // WARNING: handlePlantTrees accepts only integers, so no 0.1 Göllars or
    // stuff like this. I had some troubles using BigInt with a floating point
    // number.
    return (
      <Flex flexDirection="column">
        <Heading.h5>Plant some trees</Heading.h5>
        <Text fontSize={1}>Remove CO₂ from the atmosphere.</Text>
        <div>
          <BorderButton
            mt={2}
            fullWidth
            disabled={balance < 1 || maxCO2 < CO2_PER_GOELLAR}
            onClick={() => this.handlePlantTrees(1)}
          >
            Invest 1 Göllar to remove {CO2_PER_GOELLAR} Gigatons of CO₂
          </BorderButton>
          <hr />
        </div>
        <div>
          <BorderButton
            mt={2}
            fullWidth
            disabled={balance < 3 || maxCO2 < 3 * CO2_PER_GOELLAR}
            onClick={() => this.handlePlantTrees(1)}
          >
            Invest 3 Göllar to remove {3 * CO2_PER_GOELLAR} Gigatons of CO₂
          </BorderButton>
          <hr />
        </div>
        <div>
          <BorderButton
            mt={2}
            fullWidth
            disabled={balance < 5 || maxCO2 < 5 * CO2_PER_GOELLAR}
            onClick={() => this.handlePlantTrees(5)}
          >
            Invest 5 Göllars to remove {5 * CO2_PER_GOELLAR} Gigatons of CO₂
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
