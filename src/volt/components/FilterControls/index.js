import React from "react";
import styled from "styled-components";
import { Flex, Image, Input } from "rimble-ui";
import icnSearch from "../../assets/icn-search.svg";
import icnReset from "../../assets/icn-close.svg";

const FilterContainer = styled(Flex).attrs(() => ({
  px: 4,
  pt: 3,
  pb: 2
}))`
  width: 100%;
  align-items: center;
`;

const SearchContainer = styled(Flex).attrs(() => ({}))`
  position: relative;
  align-items: center;
  width: 100%;
`;

const StyledInput = styled.input.attrs(() => ({
  type: "text"
}))`
  width: 100%;
  border: none;
  background-color: #D9E1E2;
  border-radius: 20px;
  padding: 4px 12px;
  color: ${({ theme }) => theme.colors.voltBrandMain};
  &:active {
    outline: red;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.voltBrandMain};
  }
`;

const InputIcon = styled(Image)`
  width: 14px;
  height: 14px;
  background-color: transparent;
  position: absolute;
  right: 10px;
`;

const SearchIcon = styled(InputIcon).attrs(() => ({
  src: icnSearch
}))``;

const ResetIcon = styled(InputIcon).attrs(() => ({
  src: icnReset
}))`
  width: 20px;
  height: 20px;
`;

const FilterControls = props => {
  const { query, filter, reset } = props;
  return (
    <FilterContainer>
      <SearchContainer>
        <StyledInput value={query} onChange={filter} />
        {query !== "" ? <ResetIcon onClick={reset} /> : <SearchIcon />}
      </SearchContainer>
    </FilterContainer>
  );
};

export default FilterControls;
