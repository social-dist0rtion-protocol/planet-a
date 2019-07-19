import React from 'react';
import { Flex, Text, Image } from "rimble-ui";
import styled from 'styled-components'

const Fiat = styled(Text).attrs(()=>({
  fontSize: 4,
  fontWeight: 4
}))``;

const Token = styled(Text).attrs(()=>({
  fontSize: 1,
}))`
  color: var(--secondary-btn-text-color)
`;

const Amount = styled(Flex)`
  flex-direction: column;
  align-items: flex-end;
`;

const tokenDisplay = (amount, symbol = "", maximumFractionDigits = 2) => {
  const locale = localStorage.getItem('i18nextLng')
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: maximumFractionDigits,
  });
  return `${formatter.format(amount)} ${symbol}`
};

const valuableTokens = ["ETH"]

export  default ({icon, text, amount, tokenAmount, currencyDisplay, symbol}) => {
  let opacity;
  let fiatValue;
  let tokenValue;
  const floatNumbers = valuableTokens.includes(text) ? 5 : 2

  if(isNaN(amount)){
    opacity = 0.25;

    /* NOTE: Sometimes the exchangeRate to fiat wasn't loaded yet and hence
    * amount can become NaN. In this case, we simply pass 0 to currencyDisplay
    */

    fiatValue = currencyDisplay(0);
    tokenValue = tokenDisplay(0);
  }else{
    opacity = 1;
    fiatValue = currencyDisplay(amount);
    tokenValue = tokenDisplay(tokenAmount || amount, symbol || text, floatNumbers);
  }

  return (
    <Flex opacity={opacity} justifyContent={"space-between"} alignItems={"center"} borderBottom={1} borderColor={"#DFDFDF"} mb={3} pb={3}>
      <Flex alignItems={"center"}>
        <Image src={icon} height={"50px"} width={"50px"} mr={3} bg="transparent" />
        <Text>
          {text}
        </Text>
      </Flex>

      <Amount>
        <Fiat>{fiatValue}</Fiat>
        <Token>{tokenValue}</Token>
      </Amount>

    </Flex>
  )
};
