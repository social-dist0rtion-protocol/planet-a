// @format
import React, { Component } from "react";
import styled from "styled-components";
import { Flex } from "rimble-ui";

const Aligner = styled(Flex).attrs(()=>({
  alignItems: 'center',
  flexDirection: 'column',
  mt: 2,
  mb: 4
}))`
  color: #efcc11;
  text-align: center;
  font-family: "Saira", sans-serif;
  p,h1 {
    margin: 0;
  }
  p{
    color: #a2852e;
  }
  h5{
    color: #7a689c;
  }
`;

const CO2Display = styled.h1`
  color: #efcc11;
  font-weight: bold;
`;

const Headline = props => <p>Global Atmospheric CO2</p>;

export default class GlobalCO2 extends Component {
  render() {
    const { value } = this.props;
    if (value) {
      return (
        <Aligner>
          <h5>Global Atmospheric CO2</h5>
          <CO2Display>{value}</CO2Display>
          <p>in Gigatons</p>
        </Aligner>
      );
    } else {
      return null;
    }
  }
}
