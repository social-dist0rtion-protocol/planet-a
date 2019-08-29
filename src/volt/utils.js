import web3 from "web3";
import { Output, Outpoint }  from "leap-core";
import { voltConfig as VOLT_CONFIG } from "../volt/config";
import { getId, getData } from "../services/plasma";

export const fetchBalanceCard = async (plasma, account) => {
  const { BALANCE_CARD_COLOR } = VOLT_CONFIG;
  return await plasma.getUnspent(account, BALANCE_CARD_COLOR).then(cards => {
    // We assume every user gonna have a single balance card
    const firstCard = cards[0];
    const result = {
      id: getId(firstCard),
      data: getData(firstCard)
    };
    console.log(result);
    return result;
  });
};
export const getUTXOs = async (plasma, account, color) => {
  const utxos = await plasma.send("plasma_unspent", [account]);
  return utxos
    .filter(utxo => utxo.output.color === color)
    .map(utxo => {
      return {
        outpoint: Outpoint.fromRaw(utxo.outpoint),
        output: utxo.output
      };
    });
};

export const pad = a => {
  const str = a.toString();
  if (str.length === 3) return a;
  if (str.length === 1) return `00${a}`;
  return `0${a}`;
};
export const votesToValue = voteNum => {
  const zeroes = "000000000000000000"; // 18 digits for ERC20 token
  const voteCredits = `${voteNum}${zeroes}`;

  const hex = web3.utils.toHex(voteCredits).toUpperCase();
  const paddedHex = web3.utils.padLeft(hex, 64);
  return {
    hex: paddedHex,
    string: voteCredits
  };
};
