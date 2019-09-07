import styled from "styled-components";
import { Flex, Text } from "rimble-ui";

export const ProposalContainer = styled(Flex).attrs(() => ({
  alignItems: "center",
  px: 4,
  py: 3
}))`
  flex-shrink: 0;
  --bg-color: white;

  &:nth-of-type(2n) {
    --bg-color: ${({ theme }) => theme.colors.voltBrandLightGrey};
    background-color: var(--bg-color);
  }
  &:last-of-type {
    border-bottom: 1px solid;
    border-color: ${({ theme }) => theme.colors.voltBrandLightGrey};
  }

  @media screen and (max-height: 600px){
    padding-top: 10px;
    padding-bottom: 10px;
  }
`;

export const VoteInfo = styled(Flex).attrs(() => ({}))`
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  text-decoration: none !important;
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
  margin-right: 5px;
  &:last-of-type{
    margin-right: 0;
  }
`;

export const Title = styled(Text).attrs(() => ({
  color: "voltBrandDarkGrey"
}))`
  letter-spacing: 0.65px;
  font-weight: 700;
`;
