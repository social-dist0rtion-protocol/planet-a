import { Flex, Image, Link, Text } from "rimble-ui";
import styled from "styled-components";
import logoDeora from "../../assets/logo-deora.png";

export const DeoraLogo = styled(Image).attrs(() => ({
  src: logoDeora
}))`
  width: 12rem;
  height: auto;
  background-color: transparent;
`;

export const MenuItems = styled(Flex).attrs(() => ({
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  pt: "5rem",
  flex: 1
}))``;

export const Item = styled(Link).attrs(() => ({
  textDecoration: "none",
  fontSize: 4,
  mb: 3
}))`
  letter-spacing: 1px;
  color: ${({ theme }) => `${theme.colors.voltBrandWhite} !important`};
`;

export const AccountDetails = styled(Flex).attrs(() => ({
  flexDirection: "column",
  alignItems: 'center',
  mb: 4
}))``;

export const Label = styled(Text).attrs(() => ({
  color: "voltBrandDimPurple",
  fontSize: 2
}))``;

export const Address = styled(Text).attrs(() => ({
  color: "voltBrandWhite",
}))`
  font-weight: bold;
  font-size: 3.5vw;
  user-select: text;
  &::selection{
    background-color: ${({theme}) => theme.colors.voltBrandWhite};
    color: ${({theme}) => theme.colors.voltBrandMain};
  }
`;
