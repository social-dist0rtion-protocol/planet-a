import web3 from "web3";
import { toWei } from "web3-utils";
import { Outpoint } from "leap-core";
import { voltConfig as VOLT_CONFIG } from "../volt/config";
import { getId, getData } from "../services/plasma";
import {
  hashPersonalMessage,
  bufferToHex,
  ecsign,
  privateToAddress
} from "ethereumjs-util";
import BallotBox from './spendies/BallotBox';
import VotingBooth from './spendies/VotingBooth';

const BN = web3.utils.BN;

export const contains = (string, query) => {
  const fieldValue = string.toLowerCase();
  return fieldValue.includes(query);
};

export const fetchBalanceCard = async (plasma, account) => {
  const { BALANCE_CARD_COLOR } = VOLT_CONFIG;
  return await plasma.getUnspent(account, BALANCE_CARD_COLOR).then(cards => {
    // We assume every user gonna have a single balance card
    const firstCard = cards[0];
    const result = {
      id: getId(firstCard),
      data: getData(firstCard)
    };
    return result;
  });
};
export const getUTXOs = async (plasma, account, color) => {
  console.log(`Fetch unspent for ${color}`);
  const utxos = await plasma.send("plasma_unspent", [account, color]);

  return utxos
    .map(utxo => ({
      outpoint: Outpoint.fromRaw(utxo.outpoint),
      output: utxo.output
    }));
};

export const replaceAll = (str, find, replace) => {
  console.log(replace);
  return str.replace(new RegExp(find, "g"), replace.replace("0x", ""));
};

export const pad = a => {
  const str = a.toString();
  if (str.length === 3) return a;
  if (str.length === 1) return `00${a}`;
  return `0${a}`;
};

export const padHex = (hex, limit) => web3.utils.padLeft(hex, limit);

export const toHex = (num, limit) => {
  const hex = web3.utils.toHex(num).toUpperCase();
  return web3.utils.padLeft(hex, limit);
};

export const votesToValue = voteNum => {
  const zeroes = "000000000000000000"; // 18 digits for ERC20 token
  const voteCredits = `${voteNum}${zeroes}`;

  return {
    hex: toHex(voteCredits, 64),
    string: voteCredits
  };
};

export const signMatching = (transaction, privateKey) => {
  const addressFromPrivate = privateToAddress(privateKey);
  const address = bufferToHex(addressFromPrivate);
  const privateKeyBuffer = Buffer.from(privateKey.replace("0x", ""), "hex");
  for (let input of transaction.inputs) {
    if (address === input.address) {
      const sigHashBuf = hashPersonalMessage(transaction.sigDataBuf());
      const sig = ecsign(sigHashBuf, privateKeyBuffer);
      input.setSig(sig.r, sig.s, sig.v, address);
    }
  }
  return transaction;
};

export const generateProposal = (motionId) => {
  const motionId48 = ('00000000000' + motionId.toString(16)).substr(-12);
  const yesBox = BallotBox.withParams({
    IS_YES: '000000000001',
    MOTION_ID: motionId48
  });
  const noBox = BallotBox.withParams({
    IS_YES: '000000000000',
    MOTION_ID: motionId48
  });

  return {
    booth: VotingBooth.withParams({
      YES_BOX: yesBox.address,
      NO_BOX: noBox.address,
      PROPOSAL_ID: motionId48
    }),
    yes: yesBox,
    no: noBox
  }
};

/**
 *  Create a function to filter values Outputs greater or equal than a given `lower` value.
 * */ 
export const gte = lower => o => 
  new BN(o.output.value).gte(new BN(toWei(lower.toString())));

export const lt = lower => o => 
  new BN(o.output.value).lt(new BN(toWei(lower.toString())));

/**
 *  Select a random element from a list.
 * */ 
export const randomItem = arr => arr[Math.floor(Math.random() * arr.length)];

