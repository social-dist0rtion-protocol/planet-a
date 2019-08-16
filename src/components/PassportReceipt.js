// @format
import React, { Component } from "react";
import { Flex, Box } from "rimble-ui";
import styled, { keyframes } from "styled-components";
import { Blockie } from "dapparatus";
import newtag from "../assets/new-tag.png";
import {
  Container,
  PassportCover,
  PassportLabel,
  PassportCountry,
  PassportName
} from "./Passports/styles";

const blockieSize = 10;

export default class PassportReceipt extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      receipt: { from, to, passport }
    } = this.props;
    const name = passport.id.slice(0, 5);
    const { shortName } = passport.country;

    return (
      <div>
        <h3 style={{ textAlign: "center", marginBottom: "1em" }}>
          😭L0L you just gave your passp0rt away!!1😭
        </h3>
        <Flex alignItems="center" justifyContent="space-between">
          <Box style={{ textAlign: "center" }} width={1 / 5}>
            <Blockie address={from} config={{ size: blockieSize }} />
            {/* EXXXTREME 90ies CSS skills incoming */}
            <br />
            You
          </Box>
          <Box style={{ textAlign: "center" }} width={3 / 5}>
            <Container>
              <PassportCover key={passport.id} shortName={shortName}>
                <Flex flexDirection="column" justifyContent="flex-start">
                  <PassportCountry>{shortName}</PassportCountry>
                  <PassportLabel>Passport</PassportLabel>
                </Flex>
                <PassportName>{name}</PassportName>
              </PassportCover>
            </Container>
          </Box>
          <Box style={{ textAlign: "center" }} width={1 / 5}>
            <Blockie address={to} config={{ size: blockieSize }} />
            {/* EXXXTREME 90ies CSS skills incoming */}
            <br />
            The person that will commit crimes against humanity using your
            identity 😱
          </Box>
        </Flex>
      </div>
    );
  }
}
