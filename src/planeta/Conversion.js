import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import i18n from "../i18n";
import { Flex, Box, Heading, Text } from "rimble-ui";
import { startHandshake } from "./utils";
import { getStoredValue } from "../services/localStorage";
import { BorderButton } from "../components/Buttons";

export default class Conversion extends React.Component {
  render() {
    const { globalCO2, goBack } = this.props;
    const diff = Math.max(globalCO2 - 3420, 0);
    const factor = diff * diff * 0.00005 + 1;

    return (
      <Flex flexDirection="column">
        <Heading.h5>Convert</Heading.h5>
        {[1, 2, 2.5, 3, 3.5, 4, 5].map(i => (
          <div>{i} = {(i * factor).toFixed(2)}</div>
        ))}

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
