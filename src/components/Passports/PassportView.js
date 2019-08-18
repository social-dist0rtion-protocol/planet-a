import React from "react";
import Card, { Flex, Text } from "rimble-ui";
import { IconClose } from "./styles";
import PlanetAMoreButtons from "../../planeta/MoreButtons";

const Param = ({ label, value, color }) => {
  const locale = localStorage.getItem('i18nextLng')
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return (
    <Flex flexDirection={"Column"} alignItems="center" pt={2} px={4}>
      <Text fontSize={2} color={"silver"}>
        {label}
      </Text>
      <Text fontSize={5} fontWeight={4} color={color}>
        {formatter.format(value)}
      </Text>
    </Flex>
  );
};

const Citizen = props => {
  const { name, country } = props;
  return (
    <Flex flexDirection="column" mb={3}>
      <Text fontSize={2} textAlign="center">{`Citizen of the ${country}`}</Text>
      <Text fontSize={5} fontWeight={4} textAlign="center">
        {name.length > 0 ? name : "Mr.Mysterious"}
      </Text>
    </Flex>
  );
};

const PassportView = props => {
  const { passport, close } = props;
  const { changeView, changeAlert } = props;
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
        width="100%"
        justifyContent="space-around"
      >
        <Param label={"CO₂ Produced (Gigaton)"} value={emitted / 1000} color="emitted" />
        <Param label={"CO₂ Locked (Gigaton)"} value={locked / 1000} color="locked" />
      </Flex>
      <PlanetAMoreButtons
        changeView={changeView}
        passport={passport}
        changeAlert={changeAlert}
      />
    </Flex>
  );
};

export default PassportView;
