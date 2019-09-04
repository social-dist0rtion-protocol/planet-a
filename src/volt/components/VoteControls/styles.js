import styled from "styled-components";
import {Flex, Slider, Text} from "rimble-ui";

export const Container = styled(Flex).attrs(() => ({
  width: "100%",
  bg: "voltBrandMain",
  color: "voltBrandWhite",
  alignItems: "center",
  justifyContent: "center"
}))`
  flex-direction: column;
`;

export const SliderLabels = styled(Flex).attrs(() => ({
  mb: 3,
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center"
}))``;

export const Label = styled(Text).attrs(() => ({
  fontSize: 2,
  color: "white"
}))``;

export const StyledSlider = styled(Slider).attrs(() => ({}))`
  background-color: transparent;
  user-select: none;
  width: 100%;
  min-width: auto;
  display: flex;
  align-items: center;
  &:focus,
  &::selection {
    border: 0;
    outline: none;
  }
  &::-webkit-slider-runnable-track {
    background-color: white;
  }
  &:before {
    content: "";
    height: 20px;
    width: 4px;
    border-radius: 2px;
    background-color: white;
    display: block;
  }
  &:after {
    content: "";
    height: 20px;
    width: 4px;
    border-radius: 2px;
    background-color: white;
    display: block;
  }
`;

export const ActionButton = styled.button.attrs(() => ({}))`
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  padding: 8px;
  width: 100%;
  border: 3px solid white;
  border-radius: 8px;
  background: transparent;
  text-transform: uppercase;
  margin-bottom: 16px;
  &:last-of-type{
    margin-bottom: 0;
  }
  &:disabled {
    opacity: 0.3;
  }
`;
