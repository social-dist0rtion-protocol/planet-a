import { getStoredValue, storeValues } from "../services/localStorage";
import getConfig from "../config";

// COOLDOWN is in seconds, here we convert it to millisecods
// so we don't need to do extra conversions.
const COOLDOWN = getConfig().PLANET_A.COOLDOWN * 1000;

const getCooldownFor = passport => JSON.parse(getStoredValue("cooldown", passport) || "{}");

export function addHandshake(myPassport, theirPassport) {
  const now = Date.now();
  const cooldown = getCooldownFor(myPassport);
  for (let passport in cooldown) {
    if (now - cooldown[passport] > COOLDOWN) {
      delete cooldown[passport]
    }
  }
  cooldown[theirPassport] = now;
  storeValues({cooldown: JSON.stringify(cooldown)}, myPassport);
}

export function timeLeft(myPassport, theirPassport) {
  const now = Date.now();
  const timestamp = getCooldownFor(myPassport)[theirPassport] || 0;
  return Math.max(COOLDOWN - (now - timestamp), 0);
}
