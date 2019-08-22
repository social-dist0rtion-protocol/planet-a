import web3 from "web3";
import { getStoredValue, storeValues } from "./localStorage";
const PLAYERS = require("../assets/players.json");

// TODO: Put this in config.js
const COUNTRIES = {
  US_OF_AMBROSIA: {
    color: 49156,
    address: "0x3378420181474D3aad9579907995011D6a545E3D",
    fullName: "United States of Ambrosia",
    shortName: "USA"
  },
  US_OF_BALOONS: {
    color: 49155,
    address: "0x181fc600915c35F4e44d41f9203A7c389b4A7189",
    fullName: "United States of Baloons",
    shortName: "USB"
  },
  POLLUTISTAN: {
    color: 49160,
    address: "0xC8836f83D18caCcAB1B7C3C440f74Ea002ac2520",
    fullName: "Pollutistan",
    shortName: "PLAN"
  },
  NEW_SMOGLAND : {
    color: 49161,
    address: "0x34b0eB39c31580Ed9D0E21E257A6D574C4011D4f",
    fullName: "New Smogland",
    shortName: "SMOG"
  },
  DEMOCRATIC_REPUBLIC_OF_DEFORESTATION: {
    color: 49162,
    address: "0x03B493E1576Af494524a0664D745D83e7Cadd6dF",
    fullName: "Democratic Republic of Deforestation",
    shortName: "DRED"
  },
  CATACLYSMIA: {
    color: 49163,
    address: "0xad3e53a349c4F6515cFd8bC05D0efc4EECdD32d4",
    fullName: "Cataclysmia",
    shortName: "CASM"
  },
  TORNAYDA: {
    color: 49164,
    address: "0x56998c1670739F9cb3b5f79A16B600A2Fd952BCA",
    fullName: "Tornayda",
    shortName: "TORN"
  },
  KINGDOM_OF_HEATWAVE:{
    color: 49165,
    address: "0x0A8ab7671d216706f59eED84E25Ea7381e808323",
    fullName: "Kingdom of Heatwave",
    shortName: "HEAT"
  },
};



export const sliceHex = (hexString, start = 0, end = hexString.length) => {
  return `0x${hexString
    .slice(2) // strip 0x
    .slice(start * 2, end * 2)}`;
};
export const extractData = passport => {
  const rawData = passport.output.data;
  const value = passport.output.value;

  const nameHex = sliceHex(rawData, 0, 20);
  const imageHex = sliceHex(rawData, 20, 24);
  const lockedHex = sliceHex(rawData, 24, 28);
  const emittedHex = sliceHex(rawData, 28, 32);

  const { hexToString, hexToNumber } = web3.utils;

  const name = hexToString(nameHex) || PLAYERS[value] ? PLAYERS[value].name : "smth wrong, pls tell us";
  const image = hexToString(imageHex);
  const locked = hexToNumber(lockedHex);
  const emitted = hexToNumber(emittedHex);

  return {
    name,
    image,
    emitted,
    locked
  };
};
export const getId = passport => passport.output.value;

export const fetchAllPassports = async (plasma, account) => {
  let passports = [];
  const keys = Object.keys(COUNTRIES);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const { color, fullName, shortName } = COUNTRIES[key];
    const countryPassports = await plasma
      .getUnspent(account, color)
      .then(passports =>
        passports.map(passport => ({
          country: {
            fullName,
            shortName
          },
          color,
          data: extractData(passport),
          id: getId(passport),
          unspent: passport
        }))
      );
    passports = passports.concat(countryPassports);
  }
  return passports;
};
