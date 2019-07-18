// @format
import React, { Component } from "react";
import { Flex, Box } from "rimble-ui";
import styled, { keyframes } from "styled-components";
import { Blockie } from "dapparatus";
import handshake from "../assets/handshake.gif";
import Confetti from "react-dom-confetti";

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
	// TODO: Right now this transforms the whole Hero component, so also the text
  //transform: scaleX(${props => props.orientation});
`;

const pop = keyframes`
    50% {
      transform: scale(1.5);
    }
`;

const rotate = keyframes`
  from {
  	-webkit-transform: rotate(0deg);
  }
	to {
		-webkit-transform: rotate(359deg);
  }
`;

const ranNum = limit => {
  return Math.floor(Math.random() * limit) + 1;
};

const ranPlay = () => {
  return Math.round(Math.random()) === 0 ? true : false;
};

const Gain = styled.div`
  position: relative;
  top: ${props => props.top + "%"};
  left: ${props => props.left + "%"};
  animation: ${pop} 0.75s infinite ease-in-out
      ${props => (props.rotate ? "running" : "paused")},
    ${rotate} 0.5s 3 ease-in ${props => (props.rotate ? "paused" : "running")};
  font-size: ${props => props.size * 1 + "vw"};
  font-weight: bold;
  font-family: "Comic Sans MS", cursive, sans-serif;
  color: ${config.colors[ranNum(config.colors.length - 1)]};
  text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff,
    0 0 20px ${config.colors[ranNum(config.colors.length - 1)]},
    0 0 30px ${config.colors[ranNum(config.colors.length - 1)]},
    0 0 40px ${config.colors[ranNum(config.colors.length - 1)]},
    0 0 50px ${config.colors[ranNum(config.colors.length - 1)]},
    0 0 75px ${config.colors[ranNum(config.colors.length - 1)]};
  transition: all 1.5s ease;
`;

const blockieSize = 10;
const marginLimit = 60;

export default class TradeReceipt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orientation: Math.round(Math.random()) === 0 ? 1 : -1,
      explosion: false,
      rotate: ranPlay(),
      intervalId: 0
    };
  }

  explode() {
    // NOTE: This stops setInterval from running this function when window is
    // out of focus
    if (document.hasFocus()) {
      const { explosion } = this.state;
      this.setState({ explosion: !explosion, rotate: ranPlay() });
    }
  }

  componentDidMount() {
    this.explode();
    const intervalId = setInterval(
      this.explode.bind(this),
      config.duration - config.duration / 2
    );
    this.setState({ intervalId });
  }

  componentWillUnmount() {
    const { intervalId } = this.state;
    clearInterval(intervalId);
  }

  render() {
    const {
      receipt: { from, to, profit, emission }
    } = this.props;
    const { orientation, explosion, rotate } = this.state;

    return (
      <div>
        <h3 style={{ textAlign: "center", marginBottom: "2em" }}>
          Congratz! Your trade as generated:
        </h3>
        <Flex alignItems="center" justifyContent="space-between">
          <Box style={{ textAlign: "center" }} width={1 / 5}>
            <Blockie address={from} config={{ size: blockieSize }} />
          </Box>
          <Box style={{ textAlign: "center" }} width={3 / 5}>
            <Hero orientation={orientation} size={1.7}>
              <Gain
                left={
                  ranPlay() ? ranNum(marginLimit) : -1 * ranNum(marginLimit)
                }
                top={ranPlay() ? ranNum(marginLimit) : -1 * ranNum(marginLimit)}
                size={ranNum(5)}
                rotate={rotate}
              >
                + ${profit}
              </Gain>
              <Gain
                left={
                  ranPlay() ? ranNum(marginLimit) : -1 * ranNum(marginLimit)
                }
                top={ranPlay() ? ranNum(marginLimit) : -1 * ranNum(marginLimit)}
                size={ranNum(5)}
                rotate={!rotate}
              >
                + {emission}t CO2
              </Gain>
            </Hero>
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
