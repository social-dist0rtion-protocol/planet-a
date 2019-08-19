// @format
import React, { Component } from "react";
import { Flex, Box } from "rimble-ui";
import styled, { keyframes } from "styled-components";
import { Blockie } from "dapparatus";

const blockieSize = 10;

export default class PlantReceipt extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      receipt: { txHash, amount }
    } = this.props;

    return (
      <h3 style={{ textAlign: "center", marginBottom: "1em" }}>
        You locked {amount} Gigatonnes of CO₂
      </h3>
    );
  }
}
