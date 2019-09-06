import React from "react";
import { FullScreenContainer, ActionClose } from "../Common";
import { Container } from "../Progress/styles";
import { DeoraLogo, MenuItems, Item, AccountDetails, Label, Address } from "./styles";

const Menu = ({ onClose, account }) => (
  <FullScreenContainer>
    <Container>
      <DeoraLogo />
      <MenuItems>
        <Item target="_blank" href="https://www.deora.earth/volt-platform/about">Über uns</Item>
        <Item target="_blank" href="https://www.deora.earth/volt-platform/quadratic">Quadratical Voting</Item>
        <Item target="_blank" href="https://www.deora.earth/volt-platform/blockchain">Die Blockchain</Item>
        <Item target="_blank" href="https://www.deora.earth/volt-platform/privacy">Sicherheit & Privacy</Item>
        <Item target="_blank" href="https://www.deora.earth/volt-platform/extra-proposals">Weitere Anträge</Item>
        <Item target="_blank" href="https://www.volt.deora.earth/results">Wahlergebnisse</Item>
      </MenuItems>
      <AccountDetails>
        <Label>Your Account Address:</Label>
        <Address>{account}</Address>
      </AccountDetails>
      <ActionClose onClick={onClose}>Schließen</ActionClose>
    </Container>
  </FullScreenContainer>
);

export default Menu;
