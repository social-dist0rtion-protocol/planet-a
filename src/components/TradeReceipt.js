// @format
import React, { Component } from "react";
import { Flex, Box } from "rimble-ui";
import styled from "styled-components";
import { Blockie } from "dapparatus";

const Hero = styled.div`
  margin: auto;
  padding: 0.2em;
  height: ${props => props.size * 15 + "vw"};
  width: ${props => props.size * 15 + "vw"};
  text-align: center;
  font-size: 11vw;
  font-size: ${props => props.size * 11 + "vw"};
  border-radius: 50%;
  line-height: 1.05;
  &::before, &::after {
    float: left;
    position: absolute;
    content: "${props => props.before || props.after}";
    font-size: 1vw;
    font-weight: bold;
  }
`;

const blockieSize = 10;

export default class TradeReceipt extends Component {
  render() {
    const {
      receipt: { from, to, profit, emission }
    } = this.props;
    return (
      <Flex alignItems="center" justifyContent="space-between">
        <Box style={{ textAlign: "center" }} width={1 / 5}>
          <Blockie address={from} config={{ size: blockieSize }} />
        </Box>
        <Box style={{ textAlign: "center" }} width={3 / 5}>
          <Hero size={1.2} before={`+ $${profit}`} after={`+ ${emission}t CO2`}>
            🤝
          </Hero>
        </Box>
        <Box style={{ textAlign: "center" }} width={1 / 5}>
          <Blockie address={to} config={{ size: blockieSize }} />
        </Box>
      </Flex>
    );
  }
}
