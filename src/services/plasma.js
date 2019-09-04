import web3 from "web3";
import { getStoredValue, storeValues } from "./localStorage";

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
  }
};

export const sliceHex = (hexString, start = 0, end = hexString.length) => {
  return `0x${hexString
    .slice(2) // strip 0x
    .slice(start * 2, end * 2)}`;
};
export const extractData = nst => {
  const rawData = nst.output.data;

  const nameHex = sliceHex(rawData, 0, 20);
  const imageHex = sliceHex(rawData, 20, 24);
  const lockedHex = sliceHex(rawData, 24, 28);
  const emittedHex = sliceHex(rawData, 28, 32);

  const { hexToString, hexToNumber } = web3.utils;

  const name = hexToString(nameHex) || "Mr. Mysterious";
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
export const getId = nst => nst && nst.output && nst.output.value;
export const getData = nst => nst && nst.output && nst.output.data;

export const getCitizenship = async (plasma, account) => {
  const citizenship = getStoredValue("citizenship", account);
  if (!citizenship) {
    fetchPassportData(plasma, account);
  } else {
    return citizenship;
  }
};

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
export const fetchPassport = async (plasma, account, { color, id }) => {
  const colorPassports = await plasma.getUnspent(account, color);
  const passport = colorPassports.find(
    passport => passport.output.value === id
  );
  return passport ? extractData(passport) : null;
};
export const fetchPassportData = async (plasma, account) => {
  const { US_OF_AMBROSIA, US_OF_BALOONS } = COUNTRIES;
  const citizenship = getStoredValue("citizenship", account);
  if (!citizenship) {
    const [passport] = await plasma.getUnspent(account, US_OF_AMBROSIA.color);
    if (passport) {
      storeValues({ citizenship: "US_OF_AMBROSIA" }, account);
      const passportData = extractData(passport);
      return {
        country: US_OF_AMBROSIA.fullName,
        ...passportData
      };
    } else {
      const [passport] = await plasma.getUnspent(account, US_OF_BALOONS.color);
      const passportData = extractData(passport);
      // TODO: add cases when there is no token
      storeValues({ citizenship: "US_OF_BALOONS" }, account);
      return {
        country: US_OF_BALOONS.fullName,
        ...passportData
      };
    }
  } else {
    const { color, fullName } = COUNTRIES[citizenship];
    const [passport] = await plasma.getUnspent(account, color);
    const passportData = extractData(passport);
    return {
      country: fullName,
      ...passportData
    };
  }
};
