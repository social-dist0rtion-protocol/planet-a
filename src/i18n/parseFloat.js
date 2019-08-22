// NOTE: This module implements a localized parseFloat function
// that can be used to parse user input into correct floating point numbers.
import numeral from "numeral";
import parseDecimalNumber from "parse-decimal-number";
import i18next from "./index";

const { language } = i18next;
// NOTE: I'm not sure if it's fine to split by the IETF language tag by -
// to get the locale... numeral, however, only takes that, not the minus.
const options = numeral.localeData(language.split("-")[0]).delimiters;

export default parseDecimalNumber.withOptions(options);
