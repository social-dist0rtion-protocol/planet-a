import React from "react";
import { Flex, Text } from "rimble-ui";
import styled from "styled-components";
import { getStoredValue } from "../services/localStorage";

const Container = styled(Flex).attrs(() => ({
  flexDirection: "column",
  alignItems: "center",
  pb:3,
  mb:3,
  borderBottom: "1px solid #DFDFDF",
  width:"100%",
  justifyContent:"space-around"
}))``;

const Label = styled(Text).attrs(() => ({
  fontSize: 2,
  color: "silver"
}))``;

const Value = styled(Text).attrs(() => ({
  fontSize: 5,
  fontWeight: 4,
  color: "black"
}))``;


const GoellarsBalance = props => {
  const { balance } = props;
  const locale = getStoredValue("i18nextLng") || "en.en";
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "PYG", // We use Paraguayan guaraní to display ₲ next to a value
    currencyDisplay: "symbol",
    maximumFractionDigits: 2
  });
  const noBalance = isNaN(balance);
  const balanceValue = noBalance
    ? "--"
    : formatter.format(balance).replace('PYG', '₲');
  return (
    <Container>
      <Label>Goellars Balance</Label>
      <Value>{balanceValue}</Value>
    </Container>
  );
};

export default GoellarsBalance;
