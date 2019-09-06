import styled from "styled-components";
import { Flex, Text, Image } from "rimble-ui";
import logoDeora from "../../assets/logo-deora.png";
import logoVolt from "../../assets/logo-volt-europa.png";
import icnHamburger from "../../assets/icn-hamburger.svg";
import icnSettings from "../../assets/icn-settings.svg";

export const HeaderContainer = styled(Flex).attrs(() => ({
  p: 4,
  flexDirection: "column",
  bg: "voltBrandMain",
}))`
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  
  @media screen and (max-height: 600px){
    padding: ${({theme}) => `${theme.space[3]}px`};
  }
`;

export const TopContainer = styled(Flex).attrs(()=>({
  mb: 5,
}))`
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
    
  @media screen and (max-height: 600px){
    margin-bottom: ${({theme}) => `${theme.space[3]}px`};
  }
`;
export const LogoContainer = styled(Flex)`
  justify-content: flex-start;
  align-items: baseline;
`;
export const LogoDeora = styled(Image).attrs(() => ({
  src: logoDeora
}))`
  background-color: transparent;
  width: auto;
  height: 18px;
  @media screen and (max-height: 600px){
    height: 15px;
  }
`;
export const LogoVolt = styled(Image).attrs(() => ({
  src: logoVolt
}))`
  background-color: transparent;
  width: auto;
  height: 22px;
  position: relative;
  top: 2px;
  
  @media screen and (max-height: 600px){
    height: 17px;
  }
`;

export const LogoPadding = styled(Text).attrs(()=>({
  mx: 2,
  fontSize: 2,
  color: 'voltBrandWhite'
}))`
  line-height: 0;
`;

export const Hamburger = styled(Image).attrs(() => ({
  src: icnHamburger
}))`
  width: 32px;
  height: auto;
  background-color: transparent;
  cursor: pointer;
  
  @media screen and (max-height: 600px){
    width: 20px;
  }
`;

export const Settings = styled(Image).attrs(() => ({
  src: icnSettings,
  mr: 3,
}))`
  width: 32px;
  height: auto;
  background-color: transparent;
  cursor: pointer;
  @media screen and (max-height: 600px){
    width: 20px;
  }
`;

export const BalanceContainer = styled(Flex)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  height: 42px;
  width: 100%;
  .short{
    display: none;
  }
  
  @media screen and (max-width: 600px){
    height: 32px;
    .long{
      display: none;
    }
    .short{
      display: flex;
    }
  }
  
`;

export const Label = styled(Text).attrs(() => ({
  py: 1,
  p: 3,
  fontSize: 1
}))`
  text-transform: uppercase;
  letter-spacing: 2px;
  color: white;
  background-color: var(--bg-color);
  border: 3px solid white;
  border-right: none;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  flex: 0.6;
  box-sizing: border-box;
`;

export const Balance = styled(Text).attrs(() => ({
  color: "voltBrandMain",
  fontSize: 2,
  py: 1,
  pl: 2
}))`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  position: relative;
  box-sizing: border-box;
  height: 100%;
  flex: 0.4;
  font-weight: bold;
  letter-spacing: 2px;

  span {
    font-weight: normal;
  }

  &:after {
    content: "";
    height: 90px;
    width: 20px;
    top: -15px;
    left: -10px;
    position: absolute;
    box-shadow: -3px 0 0 white;
    background-color: ${({ theme }) => theme.colors.voltBrandMain};
    transform: rotate(20deg);
    z-index: 2;
    
    @media screen and (max-width: 600px){
      width: 16px;
    }
  }
`;

export const Value = styled(Flex)`
  margin-left: 10px;
  align-items: center;
  justify-content: center;
`;

export const Actions = styled(Flex)`
  align-items: center;
  justify-content: flex-end;
`;
