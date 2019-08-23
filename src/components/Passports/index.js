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

const findPassport = ( list, id, color ) =>
  list.find(passport => {
    const matchId = passport.id === id;
    const matchColor = passport.color === color;
    return matchId && matchColor
  });

export function getDefaultPassport(account, passports) {
  const currentPassport = JSON.parse(getStoredValue("currentPassport", account));
  let passport;

  if (currentPassport && currentPassport.id) {
    passport = passports
      ? findPassport(passports, currentPassport.id, currentPassport.color)
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
    const storedPassport = JSON.parse(getStoredValue("currentPassport", account));
    const initialState = {
      currentPassport: null,
      storedPassport
    };
    if (list && storedPassport && storedPassport.id) {
      const { id, color } = storedPassport;
      initialState.currentPassport = list
        ? findPassport(list, id, color)
        : null
    }
    this.state = initialState;

    console.log({passportStae: this.state});

    // Bind methods to class
    this.selectPassport = this.selectPassport.bind(this);
    this.closePassport = this.closePassport.bind(this);
  }

  // componentDidUpdate(prevProps) {
  //   const { list } = this.props;
  //   const { storedPassport } = this.state;
  //   if (storedPassport && list !== prevProps.list) {
  //     const { id, color } = storedPassport;
  //     this.setState({
  //       currentPassport: findPassport( list, id, color )
  //     });
  //   }
  // }

  selectPassport(id, color) {
    const { account, list } = this.props;
    const currentPassport = JSON.stringify({ id, color });
    storeValues({ currentPassport }, account);
    this.setState({
      currentPassport: findPassport(list, id, color),
      storedPassport: currentPassport
    });
  }

  closePassport() {
    const { account } = this.props;
    eraseStoredValue("currentPassport", account);
    this.setState({ currentPassport: null, storedPassport: null });
  }

  render() {
    const { currentPassport } = this.state;
    const { list, changeView, changeAlert } = this.props;
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
            const { id, color}  = passport;
            const name = id.length < 10 ? color.toString().slice(-2) + id : id.slice(0,5);
            const { shortName } = passport.country;
            return (
              <PassportCover
                key={name}
                shortName={shortName}
                onClick={() => this.selectPassport(id, color)}
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
