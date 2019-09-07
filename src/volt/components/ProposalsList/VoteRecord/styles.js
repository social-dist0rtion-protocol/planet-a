import styled from "styled-components";
import { Flex } from "rimble-ui";

export const VoteContainer = styled(Flex).attrs(() => ({
  mr: 3,
  className: "vote-container"
}))`
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  --main-color: ${({ votes, theme }) => {
    if (votes > 0) {
      return theme.colors.voltBrandGreen;
    } else {
      return votes === 0
        ? theme.colors.voltBrandGrey
        : theme.colors.voltBrandRed;
    }
  }};
  --text-color: white;
  --border-size: 3px;

  &:after {
    content: "";
    height: 90px;
    width: 6px;
    top: -11px;
    position: absolute;
    box-shadow: var(--border-size) 0 0 0 var(--main-color);
    background-color: var(--bg-color);
    transform: rotate(83deg);
    z-index: 2;
  }
`;

const Box = styled(Flex)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  padding: 5px 0;
  box-sizing: border-box;
  font-size: 18px;
  font-weight: bold;
`;

export const Votes = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  background-color: var(--main-color);
  position: relative;
  padding: 2px 0 4px;
`;

export const VotesCredits = styled(Box)`
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--main-color);
  background-color: var(--bg-color);
  border: var(--border-size) solid var(--main-color);
  position: relative;
  padding: 3px 0 0;
`;
