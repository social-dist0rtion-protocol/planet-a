import React, { Component } from "react";
import Passport from "../Passport";
import { Flex, Text } from "rimble-ui";
import {
  Container,
  PassportCover,
  PassportLabel,
  PassportCountry,
  PassportName
} from "./styles";

class Index extends Component {
  state = {
    currentPassport: null
  };
  render() {
    const { currentPassport } = this.state;
    const { list } = this.props;
    console.log({ list });
    return currentPassport !== null ? (
      <Passport
        close={() => {
          this.setState({ currentPassport: null });
        }}
        passport={list[currentPassport]}
      />
    ) : (
      <Container>
        {list ? (
          list.map((passport, i) => {
            const id = passport.id;
            const { shortName } = passport.country;
            const name = id.slice(0, 5);
            return (
              <PassportCover
                key={id}
                shortName={shortName}
                onClick={() => this.setState({ currentPassport: i })}
              >
                <Flex flexDirection="column" justifyContent="flex-start">
                  <PassportCountry>{shortName}</PassportCountry>
                  <PassportLabel>Passport</PassportLabel>
                </Flex>
                <PassportName>{name}</PassportName>
              </PassportCover>
            );
          })
        ) : (
          <Text>Processing passports data...</Text>
        )}
      </Container>
    );
  }
}

export default Index;
