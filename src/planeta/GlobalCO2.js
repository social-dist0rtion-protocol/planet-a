// @format
import React, { Component } from "react";
import styled from "styled-components";
import { Heading, Flex, Text } from "rimble-ui";

const Aligner = styled(Flex).attrs(() => ({
  alignItems: "center",
  flexDirection: "row",
  mt: 2
}))`
  color: #efcc11;
  text-align: center;
  font-family: "Saira", sans-serif;
  p {
    color: #a2852e;
    text-align: center;
    width: 100%;
  }
  h1 {
    flex: 1 1 0;
    text-align: right;
    margin: 0;
    margin-right: 16px;
  }
`;

const Label = styled(Text).attrs(() => ({
  px: 3,
  fontWeight: "bold"
}))`
    flex: 1.5 1.5 0;
    text-align: left;
    color: #cec6ff;
    margin: 0;
`;

const CO2Display = styled.h1`
  color: #efcc11;
  font-weight: bold;
`;

const NextDisplay = styled.h1`
  color: red;
  font-weight: bold;
  font-size: 24px;
`;

export default class GlobalCO2 extends Component {
  render() {
    const { value } = this.props;
    let toNext = 3420 - value;
    let message;
    if (toNext <= 0) {
      toNext = 4170 - value;
      message = "CO₂ left to meltdown";
    } else {
      message = "CO₂ left to tipping point";
    }

    if (value) {
      return (
        <>
          <Aligner>
            <Label>Global Atmospheric CO₂</Label>
            <CO2Display>{Math.round(value)}</CO2Display>
          </Aligner>
          <Aligner>
            <Label>{message}</Label>
            <NextDisplay>{Math.round(toNext)}</NextDisplay>
          </Aligner>
          <Aligner>
            <p>
              values in <em>Gigatons</em>
            </p>
          </Aligner>
        </>
      );
    } else {
      return null;
    }
  }
}
