// @format
import React from "react";
import { Flex, Icon, Box } from "rimble-ui";
import { PrimaryButton, BorderButton } from "../components/Buttons";

export default ({ changeView, passport, changeAlert }) => {
  const passportAlert = () =>
    changeAlert({ type: "warning", message: "Select a passport" });
  return (
    <Flex
      pb={3}
      mb={3}
      borderBottom={"1px solid #DFDFDF"}
      width="100%"
      flexDirection="column"
    >
      <Flex mb={3}>
        <PrimaryButton
          mr={2}
          fullWidth
          onClick={() => {
            if (passport) {
              changeView("planet_a_handshake");
            } else {
              passportAlert();
            }
          }}
        >
          <Flex alignItems="center">
            <Icon name="Loop" mr={2} />
            Handshake
          </Flex>
        </PrimaryButton>
        <PrimaryButton
          ml={2}
          fullWidth
          onClick={() => {
            if (passport) {
              changeView("planet_a_plant_trees");
            } else {
              passportAlert();
            }
          }}
        >
          <Flex mx={-2} alignItems="center">
            <Icon name="NaturePeople" mr={2} />
            Plant Trees
          </Flex>
        </PrimaryButton>
      </Flex>
      <Flex>
        <BorderButton
          style={{ opacity: 0.5 }}
          fullWidth
          onClick={() => {
            if (passport) {
              changeView("planet_a_transfer_passport");
            } else {
              passportAlert();
            }
          }}
        >
          <Flex alignItems="center">
            <Icon name="Forward" mr={2} />
            Transfer Passport
          </Flex>
        </BorderButton>
      </Flex>
    </Flex>
  );
};
