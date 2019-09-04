import React from "react";
import { Link } from 'react-router-dom';
import {
  HeaderContainer,
  TopContainer,
  LogoContainer,
  LogoDeora,
  LogoVolt,
  LogoPadding,
  Hamburger,
  BalanceContainer,
  Balance,
  Label,
  Value
} from "./styles";

export const Header = props => {
  const { credits, maxCredits = 120, openMenu } = props;
  return (
    <HeaderContainer>
      <TopContainer>
        <Link to="/">
          <LogoContainer>
            <LogoDeora/>
            <LogoPadding>x</LogoPadding>
            <LogoVolt/>
          </LogoContainer>
        </Link>
        <Hamburger onClick={openMenu} />
      </TopContainer>
      <BalanceContainer>
        <Label>DEINE VOICECREDITS</Label>
        <Balance>
          <Value>
            {credits || "--"} <span>/{maxCredits}</span>{" "}
          </Value>
        </Balance>
      </BalanceContainer>
    </HeaderContainer>
  );
};
