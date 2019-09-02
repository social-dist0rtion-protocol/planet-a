import styled from "styled-components";
import { Flex, Text } from "rimble-ui";

export const ProposalContainer = styled(Flex).attrs(() => ({
  alignItems: "center",
  p: 3
}))`
  --bg-color: white;

  &:nth-of-type(2n) {
    --bg-color: ${({ theme }) => theme.colors.voltBrandLightGrey};
    background-color: var(--bg-color);
  }
  &:last-of-type {
    border-bottom: 1px solid;
    border-color: ${({ theme }) => theme.colors.voltBrandLightGrey};
  }
`;

export const VoteInfo = styled(Flex).attrs(() => ({}))`
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
`;

export const TopPart = styled(Flex).attrs(() => ({}))`
  align-items: center;
`;

export const ProposalId = styled(Text).attrs(() => ({
  mr: 2
}))`
  font-style: italic;
`;

export const Topic = styled(Flex).attrs(() => ({
  px: 2,
  py: "2px",
  borderRadius: 1,
  fontSize: 0,
  color: "voltBrandDarkGrey",
  borderColor: "voltBrandDarkGrey"
}))`
  border: 1px solid;
`;

export const Title = styled(Text).attrs(() => ({
  color: "voltBrandDarkGrey"
}))`
  letter-spacing: 0.65px;
  font-weight: 700;
`;
