// @format
import React, { Component } from "react";
import PassportView from "./PassportView";
import { Flex } from "rimble-ui";
import {
  Loading,
  Container,
  PassportCover,
  PassportLabel,
  PassportCountry,
  PassportName
} from "./styles";
import {
  getStoredValue,
  storeValues,
  eraseStoredValue
} from "../../services/localStorage";

export function getDefaultPassport(account, passports) {
  const passportId = getStoredValue("currentPassport", account);
  let passport;

  if (passportId) {
    passport = passports
      ? passports.find(passport => passport.id === passportId)
      : null;
  }
  if (!passport && passports && passports.length === 1) {
    passport = passports[0];
  }
  return passport;
}

export class Passports extends Component {
  constructor(props) {
    super(props);
    const { account, list } = props;
    const passportId = getStoredValue("currentPassport", account);
    const initialState = {
      currentPassportId: passportId
    };
    if (passportId) {
      initialState.currentPassport = list
        ? list.find(passport => passport.id === passportId)
        : null;
    }
    this.state = initialState;

    // Bind methods to class
    this.selectPassport = this.selectPassport.bind(this);
    this.closePassport = this.closePassport.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { list } = this.props;
    const { currentPassportId } = this.state;
    if (currentPassportId && list !== prevProps.list) {
      this.setState({
        currentPassport: list.find(
          passport => passport.id === currentPassportId
        )
      });
    }
  }

  selectPassport(id) {
    const { account, list } = this.props;
    storeValues({ currentPassport: id }, account);
    this.setState({
      currentPassport: list.find(passport => passport.id === id)
    });
  }

  closePassport() {
    const { account } = this.props;
    eraseStoredValue("currentPassport", account);
    this.setState({ currentPassport: null, currentPassportId: null });
  }

  render() {
    const { currentPassport } = this.state;
    const { list, account, changeView, changeAlert } = this.props;
    return currentPassport ? (
      <PassportView
        close={this.closePassport}
        passport={currentPassport}
        changeView={changeView}
        changeAlert={changeAlert}
      />
    ) : (
      <Container>
        {list ? (
          list.map(passport => {
            const id = passport.id;
            const { shortName } = passport.country;
            const name = id.slice(0, 5);
            return (
              <PassportCover
                key={id}
                shortName={shortName}
                onClick={() => this.selectPassport(id)}
                single={list.length === 1}
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
          <Loading>Processing passports data...</Loading>
        )}
        {list && list.length === 0 ? (
          <Loading>
            You don't have a passport yet. Scan a paper wallet to receive one or
            come to the support desk to receive help!
          </Loading>
        ) : null}
      </Container>
    );
  }
}
