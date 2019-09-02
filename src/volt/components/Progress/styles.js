import { Flex, Text } from "rimble-ui";
import styled, { keyframes } from "styled-components";

export const Container = styled(Flex).attrs(() => ({
  bg: "voltBrandMain",
  px: '3rem',
  pt: '6rem',
  pb: '3rem',
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: 'center'
}))`
  position: absolute;
  width: 100%;
  height: 100%;
`;

export const TopPart = styled(Flex).attrs(() => ({
  flexDirection: "column",
  justifyContent: "center"
}))``;

export const Message = styled(Text).attrs(() => ({
  mb: 4,
  fontSize: '18px',
  color: "voltBrandWhite",
  textAlign: "center"
}))`
  font-weight: bold;
`;

const loading = keyframes`
  
  0%,10% {
    left: 0;
    right: 100%;
  }

  50%{
    left: 0;
    right: 0;
  }
  
  90%, 100% {
    left: 100%;
    right: 0;
  }
`;

export const InfiniteProgress = styled(Flex).attrs(() => ({
  bg: "voltBrandDimPurple",
  borderRadius: 3
}))`
  width: 100%;
  height: 6px;
  position: relative;
  overflow: hidden;
  &:after {
    content: "";
    display: block;
    left: 0;
    right: 0;
    height: 100%;
    background-color: white;
    position: absolute;
    border-radius: 16px;
    animation: ${loading} 1s linear alternate infinite;
  }
`;

export const LogoContainer = styled(Flex).attrs(() => ({
  flexDirection: "column"
}))`
  align-items: center;
  justify-content: center;
`;

export const Logotype = styled(Text).attrs(() => ({
  fontSize: 4,
  color: "voltBrandWhite",
  mb: 1
}))`
  text-transform: uppercase;
  font-weight: bold;
`;
