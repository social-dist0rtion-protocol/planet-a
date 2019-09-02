import { Flex, Image, Link } from "rimble-ui";
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
  pt: '5rem',
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
