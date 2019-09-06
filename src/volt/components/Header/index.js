import React from "react";
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import {
  HeaderContainer,
  TopContainer,
  LogoContainer,
  LogoDeora,
  LogoVolt,
  LogoPadding,
  Actions,
  Settings,
  Hamburger,
  BalanceContainer,
  Balance,
  Label,
  Value
} from "./styles";

import { factor18 } from '../../utils';

const BN = Web3.utils.BN;

export const Header = props => {
  const { credits, maxCredits = 25, openMenu } = props;
  let availableCredits = '--';
  if (credits) {
    availableCredits = new BN(credits).div(factor18).toString();
  }
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
        <Actions>
          <Link to="/settings">
           <Settings/>
          </Link>
          <Hamburger onClick={openMenu} />
        </Actions>
      </TopContainer>
      <BalanceContainer>
        <Label className="long">MEINE VOICE CREDITS</Label>
        <Label className="short">VOICE CREDITS</Label>
        <Balance>
          <Value>
            {availableCredits} <span>/{maxCredits}</span>{" "}
          </Value>
        </Balance>
      </BalanceContainer>
    </HeaderContainer>
  );
};
