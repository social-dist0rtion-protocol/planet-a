import React from "react";
import { Flex, Text } from "rimble-ui";

const Param = ({ label, value, color }) => {
  return (
    <Flex flexDirection={"Column"} alignItems="center" py={2} px={4}>
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
    <Flex flexDirection="column">
      <Text mb={2} fontSize={5} fontWeight={4} textAlign="center">
        {name.length > 0 ? name : "Mr.Mysterious"}
      </Text>
      <Text
        mb={3}
        fontSize={3}
        textAlign="center"
      >{`Citizen of the ${country}`}</Text>
    </Flex>
  );
};

const Passport = props => {
  const { data, close } = props;
  console.log({ data });
  const country = data ? data.country : "World";
  if (!data) {
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
    <Flex flexDirection="column" alignItems="center">
      <p onClick={close}>Close</p>
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
