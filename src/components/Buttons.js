import styled from "styled-components";
import { Button, OutlineButton } from "rimble-ui";

export const PrimaryButton = styled(Button)`
  cursor: pointer;
  color: var(--primary-btn-text-color);
  background-color: var(--primary-btn-bg-color) !important;
  border-bottom: 3px solid var(--primary-btn-border-color);
  &:hover {
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.15);
    border: 1px solid transparent;
  }
  &:focus {
    outline: 0;
  }
  @media screen and (max-width: 480px){
    padding-left: 0;
    padding-right: 0;
  }
`;

export const ActionButton = styled(Button)`
  cursor: pointer;
  background-color: #41545f !important;
  border: 1px solid #182933;
  color: #cad7de;
  & span {
    display: flex;
    align-items: center;
  }
`;

export const BorderButton = styled(OutlineButton)`
  cursor: pointer;
  color: var(--secondary-btn-text-color);
  border-bottom: 3px solid var(--secondary-btn-border-color);
  background-color: var(--secondary-btn-bg-color) !important;
  &:hover {
    color: var(--secondary-btn-text-color);
    border: 1px solid transparent;
  }
  &:focus {
    outline: 0;
  }
  @media screen and (max-width: 480px){
    padding-left: 0;
    padding-right: 0;
  }
`;
