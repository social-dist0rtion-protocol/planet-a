// NOTE: This module implements a localized parseFloat function
// that can be used to parse user input into correct floating point numbers.
import parseDecimalNumber from "parse-decimal-number";
import options from './languageOptions';
import i18next from "./index";

const { language } = i18next;
const shortName = language.slice(0,2);

export default parseDecimalNumber.withOptions(options[shortName]);
