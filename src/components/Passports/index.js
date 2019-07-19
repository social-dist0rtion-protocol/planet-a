import React, { Component } from "react";
import Passport from "../Passport";
import {
  Container,
  PassportCover,
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
        data={list ? list[currentPassport].data : null}
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
                <PassportCountry>{shortName}</PassportCountry>
                <PassportName>{name}</PassportName>
              </PassportCover>
            );
          })
        ) : (
          <div>loading data...</div>
        )}
      </Container>
    );
  }
}

export default Index;
