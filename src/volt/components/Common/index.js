import styled from "styled-components";
import { Flex } from "rimble-ui";
import icnFavorites from "../../assets/icn-favorites.png";
import icnBack from "../../assets/icn-back.svg";

export const MainContainer = styled(Flex).attrs(() => ({
  flexDirection: "column",
  bg: "voltBrandWhite"
}))`
  position: relative;
  height: 100vh;
`;

export const FullScreenContainer = styled(Flex).attrs(() => ({}))`
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 5;
`;

export const ActionClose = styled.button.attrs(() => ({}))`
  color: ${({ theme }) => theme.colors.voltBrandMain};
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border: 3px solid white;
  border-radius: 8px;
  background-color: white;
  &:disabled {
    opacity: 0.3;
  }
`;

export const Star = styled(Flex).attrs(() => ({}))`
  cursor: pointer;
  width: 25px;
  height: 24px;
  background-image: url(${icnFavorites});
  background-position-x: ${({ active = false }) => (active ? "-25px" : 0)};
`;

export const Back = styled(Flex).attrs(() => ({}))`
  cursor: pointer;
  width: 15px;
  height: 24px;
  background-image: url(${icnBack});
`;
