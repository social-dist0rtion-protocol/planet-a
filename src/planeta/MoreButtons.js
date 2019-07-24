import React from "react";
import { Flex, Icon, Box } from "rimble-ui";
import { PrimaryButton } from "../components/Buttons";

export default ({ changeView, defaultPassport, changeAlert }) => {
  const passportAlert = () =>
    changeAlert({ type: "warning", message: "Select a passport" });
  return (
    <Flex mx={-2}>
      <Box flex={1} m={2}>
        <PrimaryButton
          fullWidth
          onClick={() => {
            if (defaultPassport) {
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
      </Box>
      <Box flex={1} m={2}>
        <PrimaryButton
          fullWidth
          onClick={() => {
            changeAlert({ type: "warning", message: "Not yet implemented" });
            /*
            if (defaultPassport) {
              changeView("planet_a_plant_trees");
            } else {
              passportAlert();
            }
            */
          }}
        >
          <Flex mx={-2} alignItems="center">
            <Icon name="NaturePeople" mr={2} />
            Plant Trees
          </Flex>
        </PrimaryButton>
      </Box>
    </Flex>
  );
};
