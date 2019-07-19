import { Flex, Text } from "rimble-ui";
import styled from "styled-components";

export const Container = styled(Flex).attrs(() => ({
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  pb: 3,
  mb: 3,
  borderBottom: "1px solid #DFDFDF",
  width: "100%"
}))`
  transition: transform 0.5s ease-in-out;
  cursor: pointer;
`;

export const PassportCover = styled(Flex).attrs(({ shortName }) => ({
  flexDirection: "column",
  bg: `passport${shortName}`,
  mx: 2,
  px: 3,
  py: 2,
  height: 4,
  justifyContent: "flex-end"
}))`
  border-radius: 0 4px 4px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

export const PassportCountry = styled(Text).attrs(() => ({
  color: "white",
  fontSize: 4,
  fontWeight: 4,
  textAlign: 'center'
}))``;

export const PassportName = styled(Text).attrs(() => ({
  color: "white",
  fontSize: 2,
  fontWeight: 2,
  textAlign: 'center'
}))``;
