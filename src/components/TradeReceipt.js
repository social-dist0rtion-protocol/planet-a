// @format
import React, { Component } from "react";
import { Flex, Box } from "rimble-ui";
import styled from "styled-components";
import { Blockie } from "dapparatus";
import handshake from "../assets/handshake.gif";
import Confetti from "react-dom-confetti";

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
  background-image: url(${handshake});
  background-repeat:no-repeat;
  background-position: ${props => props.size * -4.5 + "vw"};
  background-size: ${props => props.size * 28 + "vw"};
  transform: scaleX(${props => props.orientation});
  &::before, &::after {
    float: left;
    position: absolute;
    content: "${props => props.before || props.after}";
    font-size: 1vw;
    font-weight: bold;
  }
`;

const blockieSize = 10;
const config = {
  angle: 90,
  spread: 90,
  startVelocity: 45,
  elementCount: "200",
  dragFriction: 0.1,
  duration: 6000,
  stagger: 0,
  width: "10px",
  height: "10px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

export default class TradeReceipt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orientation: Math.round(Math.random()) === 0 ? 1 : -1,
      explosion: false
    };
  }

  componentDidMount() {
    this.setState({ explosion: true });
  }

  render() {
    const {
      receipt: { from, to, profit, emission }
    } = this.props;
    const { orientation, explosion } = this.state;

    return (
      <div>
        <Flex alignItems="center" justifyContent="space-between">
          <Box style={{ textAlign: "center" }} width={1 / 5}>
            <Blockie address={from} config={{ size: blockieSize }} />
          </Box>
          <Box style={{ textAlign: "center" }} width={3 / 5}>
            <Hero
              orientation={orientation}
              size={1.5}
              before={`+ $${profit}`}
              after={`+ ${emission}t CO2`}
            />
          </Box>
          <Box style={{ textAlign: "center" }} width={1 / 5}>
            <Blockie address={to} config={{ size: blockieSize }} />
          </Box>
        </Flex>
        <Flex alignItems="center" justifyContent="center">
          <Confetti active={explosion} config={config} />
        </Flex>
      </div>
    );
  }
}
