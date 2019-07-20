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

class Passports extends Component {
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

  componentWillReceiveProps({ list }) {
    const { currentPassportId } = this.state;
    if (currentPassportId && this.props.list !== list) {
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
    const { list } = this.props;
    return currentPassport ? (
      <PassportView close={this.closePassport} passport={currentPassport} />
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
      </Container>
    );
  }
}

export default Passports;
