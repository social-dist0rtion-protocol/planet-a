import styled from "styled-components";
import { Flex } from "rimble-ui";

export const ListContainer = styled(Flex).attrs(() => ({}))`
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.voltBrandWhite};
  flex: 1;
  overflow: auto;
`;
