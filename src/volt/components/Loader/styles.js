import styled from "styled-components";
import { Container } from "../Progress/styles";
import { InfiniteProgress } from "../Progress/styles";

export const LoaderContainer = styled(Container)`
  justify-content: center;
`;

export const ProgressBar = styled(InfiniteProgress)`
  width: 192px;
`;
