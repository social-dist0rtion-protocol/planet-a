import React from "react";
import {
  Container,
  TopPart,
  Message,
  InfiniteProgress,
  LogoContainer,
  Logotype
} from "./styles";
import { FullScreenContainer } from "../Common";

const Logo = () => {
  return (
    <LogoContainer>
      <Logotype>Volt</Logotype>
      <Logotype>Deora.Earth</Logotype>
    </LogoContainer>
  );
};

const Progress = props => {
  const { message } = props;
  return (
    <FullScreenContainer>
      <Container>
        <TopPart>
          <Message>{message}</Message>
          <InfiniteProgress />
        </TopPart>
        <Logo />
      </Container>
    </FullScreenContainer>
  );
};

export default Progress;
