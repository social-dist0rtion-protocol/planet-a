import styled from "styled-components";
import { Flex } from "rimble-ui";

export const ListContainer = styled(Flex).attrs(() => ({}))`
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.voltBrandWhite};
  flex: 1;
  
  /* has to be scroll, not auto to work on mobile properly */
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;
