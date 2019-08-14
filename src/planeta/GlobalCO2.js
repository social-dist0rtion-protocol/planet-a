// @format
import React, { Component } from "react";
import styled from "styled-components";

const Aligner = styled.div`
  display: block;
  height: auto;
  width: 100%;
  color: #efcc11;
  text-align: center;
  margin: 1em 0 2em 0;
`;

const CO2Display = styled.h1`
  color: #efcc11;
  font-weight: bold;
  padding: 0 0 0 0;
  margin: 0 0 0 0;
`;

const Headline = props => <p>Global Atmospheric CO2</p>;

export default class GlobalCO2 extends Component {
  render() {
    const { value } = this.props;
    if (value) {
      return (
        <Aligner>
          <h5 style={{ color: "#7a689c" }}>Global Atmospheric CO2</h5>
          <CO2Display>{value}</CO2Display>
          <p style={{ color: "#a2852e" }}>in Gigatons</p>
        </Aligner>
      );
    } else {
      return null;
    }
  }
}
