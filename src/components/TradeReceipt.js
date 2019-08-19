// @format
import React, { Component } from "react";
import { Flex, Box } from "rimble-ui";
import styled, { keyframes } from "styled-components";
import { Blockie } from "dapparatus";
import handshake from "../assets/handshake.gif";
import kaching from "../assets/ka-ching.mp3";
import pollution from "../assets/pollution.mp3";
import monsterkill from "../assets/unreal-tournament-monster-kill-sound.mp3";
import humiliation from "../assets/unreal-tournament-humiliation-sound.mp3";
import surprise from "../assets/surprise.gif";
import rekt from "../assets/rekt.gif";
import sadtrombone from "../assets/sad-trombone.mp3";
import newtag from "../assets/new-tag.png";
import pingu from "../assets/pingu.gif";
import Confetti from "react-dom-confetti";
import Sound from "react-sound";

const config = {
  angle: 90,
  spread: 90,
  startVelocity: 45,
  elementCount: "10",
  dragFriction: 0.1,
  duration: 4000,
  stagger: 0,
  width: "60px",
  height: "60px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

const Hero = styled.div`
  margin: auto;
  padding: 0.2em;
  text-align: center;
  font-size: 11vw;
  font-size: ${props => props.size * 11 + "vw"};
  border-radius: 50%;
  line-height: 1.05;
  img {
    margin-top: -5vw;
    border-radius: 50%;
    height: ${props => props.size * 30 + "vw"};
    width: ${props => props.size * 30 + "vw"};
    @media screen and (min-width: 666px) {
      height: 20vw;
      width: 20vw;
    }
  }
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
  position: absolute;
  white-space: nowrap;
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

const blockieSize = 6;
const marginLimit = 60;

export default class TradeReceipt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orientation: Math.round(Math.random()) === 0 ? 1 : -1,
      explosion: false,
      rotate: ranPlay(),
      intervalId: 0,
      soundStatus: Sound.status.PLAYING,
      positions: {
        profit: {
          top: ranPlay() ? ranNum(marginLimit) : -1 * ranNum(marginLimit),
          left: ranPlay() ? ranNum(marginLimit) : -1 * ranNum(marginLimit)
        },
        emission: {
          top: ranPlay() ? ranNum(marginLimit) : -1 * ranNum(marginLimit),
          left: ranPlay() ? ranNum(marginLimit) : -1 * ranNum(marginLimit)
        }
      }
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
    // TODO: Instead of using setInterval, use an actual FPS function like
    // window.requestAnimationFrame()
    const intervalId = setInterval(
      this.explode.bind(this),
      config.duration - config.duration / 10
    );
    this.setState({ intervalId });
  }

  componentWillUnmount() {
    const { intervalId } = this.state;
    clearInterval(intervalId);
  }

  render() {
    const {
      receipt: {
        myAddress,
        theirAddress,
        myGoellars,
        myCO2,
        myDefect,
        theirDefect
      }
    } = this.props;
    const {
      orientation,
      explosion,
      rotate,
      soundStatus,
      positions
    } = this.state;

    // U done goofed?
    let message, sound, jif;

    if (myDefect && theirDefect) {
      // Both cheated
      message = "(╯°□°）╯︵ ┻━┻ OH noes! Both of you were greedy!";
      jif = rekt;
      sound = (
        <Sound
          url={sadtrombone}
          playStatus={soundStatus}
          onFinishedPlaying={() =>
            this.setState({ soundStatus: Sound.status.STOPPED })
          }
        />
      );
    } else if (myDefect && !theirDefect) {
      // I cheated
      message = "🔪  M-M-Monsterkill !!1 💣";
      jif = pingu;
      sound = (
        <Sound
          url={monsterkill}
          playStatus={soundStatus}
          onFinishedPlaying={() =>
            this.setState({ soundStatus: Sound.status.STOPPED })
          }
        />
      );
    } else if (!myDefect && theirDefect) {
      // My handshake partner cheated; I lost
      message = "( ͡° ͜ʖ ͡°) You got rekt! ( ͡° ͜ʖ ͡°)";
      jif = surprise;
      sound = (
        <Sound
          url={humiliation}
          playStatus={soundStatus}
          onFinishedPlaying={() =>
            this.setState({ soundStatus: Sound.status.STOPPED })
          }
        />
      );
    } else {
      // We both played fair
      message = "😚 Congraz, you both played fairly! (✿◠‿◠)";
      jif = handshake;
      sound = (
        <Sound
          url={kaching}
          playStatus={soundStatus}
          onFinishedPlaying={() =>
            this.setState({ soundStatus: Sound.status.STOPPED })
          }
        />
      );
    }

    return (
      <div>
        <h3 style={{ textAlign: "center", marginBottom: "1em" }}>{message}</h3>
        <Flex alignItems="center" justifyContent="space-between">
          <Box style={{ textAlign: "center" }} width={1 / 5}>
            <Blockie address={myAddress} config={{ size: blockieSize }} />
            {/* EXXXTREME 90ies CSS skills incoming */}
            <br />
            You
          </Box>
          <Box style={{ textAlign: "center" }} width={3 / 5}>
            <Hero orientation={orientation} size={1.7}>
              <img src={jif} />
              <Gain
                left={ranNum(marginLimit)}
                top={ranNum(marginLimit)}
                size={ranNum(10)}
                rotate={rotate}
              >
                + ₲{myGoellars}
              </Gain>
              <Gain
                left={ranNum(marginLimit)}
                top={ranNum(marginLimit)}
                size={ranNum(10)}
                rotate={!rotate}
              >
                + {myCO2}
                Gt CO2
              </Gain>
            </Hero>
          </Box>
          <Box style={{ textAlign: "center" }} width={1 / 5}>
            <Blockie address={theirAddress} config={{ size: blockieSize }} />
            {/* EXXXTREME 90ies CSS skills incoming */}
            <br />
            Your <img style={{ width: "2vw" }} src={newtag} /> buddy
          </Box>
        </Flex>
        {sound}
      </div>
    );
  }
}
