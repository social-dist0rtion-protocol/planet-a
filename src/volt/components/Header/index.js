import React from "react";
import { Flex, Text } from "rimble-ui";
import styled from "styled-components";

const HeaderContainer = styled(Flex).attrs(() => ({
  p: 2,
  flexDirection: "column",
  bg: "voltBrandMain",
  height: "160px"
}))`
  align-items: center;
  justify-content: center;
`;

const BalanceContainer = styled(Flex).attrs(() => ({
  p: 2,
  justifyContent: "space-between",
  width: "100%"
}))``;

const Label = styled(Text).attrs(() => ({
  color: "voltBrandWhite"
}))``;

const Balance = styled(Text).attrs(() => ({
  color: "voltBrandWhite"
}))`
  font-weight: bold;
`;

export const Header = props => {
  const { tokens, credits } = props;
  return (
    <HeaderContainer>
      <BalanceContainer>
        <Label>Voice Tokens</Label>
        <Balance>{tokens || "--"}</Balance>
      </BalanceContainer>
      <BalanceContainer>
        <Label>Voice Credits</Label>
        <Balance>{credits || "--"}</Balance>
      </BalanceContainer>
    </HeaderContainer>
  );
};
