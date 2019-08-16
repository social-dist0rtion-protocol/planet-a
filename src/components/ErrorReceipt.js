// @format
import React, { Component } from "react";
import { Flex, Box } from "rimble-ui";

export default class ErrorReceipt extends Component {
  render() {
    const {
      receipt: { message }
    } = this.props;

    return (
      <div>
        <h3
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "1em"
          }}
        >
          ❌ Err0r! 😭
        </h3>
        <Flex alignItems="center" justifyContent="space-between">
          <Box style={{ textAlign: "center" }} width={1}>
            {/* Yeah this is not rimble-ui but I really had no time... */}
            <i
              className="fas fa-times-circle"
              style={{
                color: "rgb(233, 23, 23)",
                fontSize: 180,
                opacity: 0.7,
                marginBottom: "10px"
              }}
            />
            <h5>{message}</h5>
          </Box>
        </Flex>
      </div>
    );
  }
}
