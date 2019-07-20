import React from "react";
import { Flex, Text } from "rimble-ui";
import { IconClose } from "./Passports/styles";

const Param = ({ label, value, color }) => {
  return (
    <Flex flexDirection={"Column"} alignItems="center" pt={2} px={4}>
      <Text fontSize={1} color="copyColor">
        {label}
      </Text>
      <Text fontSize={5} fontWeight={4} color={color}>
        {value}
      </Text>
    </Flex>
  );
};

const Citizen = props => {
  const { name, country } = props;
  return (
    <Flex flexDirection="column" mb={3}>
      <Text
        fontSize={2}
        textAlign="center"
      >{`Citizen of the ${country}`}</Text>
      <Text fontSize={5} fontWeight={4} textAlign="center">
        {name.length > 0 ? name : "Mr.Mysterious"}
      </Text>
    </Flex>
  );
};

const Passport = props => {
  const { passport, close } = props;
  const { data } = passport;
  const country = passport.country.fullName;
  if (!passport) {
    return (
      <Flex justifyContent="center" opacity={0.25}>
        <Text color="copyColor">
          Border Control is checking your passport...
        </Text>
      </Flex>
    );
  }

  const { emitted, locked, name } = data;
  return (
    <Flex flexDirection="column" alignItems="center" pt={3}>
      <IconClose onClick={close} />
      <Citizen name={name} country={country} />
      <Flex
        pb={3}
        mb={3}
        borderBottom={"1px solid #DFDFDF"}
        width="100%"
        justifyContent="space-around"
      >
        <Param label={"CO2 Produced"} value={emitted} color="emitted" />
        <Param label={"CO2 Locked"} value={locked} color="locked" />
      </Flex>
    </Flex>
  );
};

export default Passport;
