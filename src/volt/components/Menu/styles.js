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
  pt: "3rem",
  flex: 1
}))`
  @media screen and (max-height: 600px){
    padding-top: 5vh;   
  }
`;

export const Item = styled(Link).attrs(() => ({
  textDecoration: "none",
  fontSize: 4,
  mb: 3
}))`
  text-align: center;
  letter-spacing: 1px;
  color: ${({ theme }) => `${theme.colors.voltBrandWhite} !important`};
  
  @media screen and (max-height: 600px){
    font-size: ${({theme})=>`${theme.fontSizes[3]}px`};
  }
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
