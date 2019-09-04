import React, { Component } from "react";
import Web3 from "web3";
import { Tx, Input, Output, helpers } from "leap-core";
import { providers, utils } from "ethers";
import SMT from "../../lib/SparseMerkleTree";
import { getStoredValue, storeValues } from "../../../services/localStorage";

import votingBoothArtifact from "../../contracts/VotingBooth";
import ballotBoxInterface from '../../contracts/ballotBox'

import { Equation } from "./GridDisplay";
import { Choice } from "./Choice";
import {
  SliderLabels,
  Container,
  Label,
  StyledSlider,
  ActionButton
} from "./styles";
import { votesToValue, getUTXOs, toHex, padHex, replaceAll } from "../../utils";
import { voltConfig } from "../../config";
import { getData, getId } from "../../../services/plasma";
import Progress from "../Progress";
import { bytecode, template } from "../../contracts/voteBooth";
import Receipt from "../Receipt";

const RPC = "https://testnet-node1.leapdao.org";
const plasma = new providers.JsonRpcProvider(RPC);

class VoteControls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      votes: 0,
      choice: "",
      showProgress: false,
      showReceipt: false
    };
    this.collapse = this.collapse.bind(this);
    this.expand = this.expand.bind(this);
    this.setProgressState = this.setProgressState.bind(this);
    this.setReceiptState = this.setReceiptState.bind(this);
    this.resetState = this.resetState.bind(this);

    this.setTokenNumber = this.setTokenNumber.bind(this);
    this.setChoice = this.setChoice.bind(this);

    this.prepareScript = this.prepareScript.bind(this);
    this.getOutputs = this.getOutputs.bind(this);
    this.constructVote = this.constructVote.bind(this);
    this.signVote = this.signVote.bind(this);
    this.processVote = this.processVote.bind(this);

    this.submitVote = this.submitVote.bind(this);
    this.withdrawVote = this.withdrawVote.bind(this);

    console.log(votingBoothArtifact.abi);
  }

  setTokenNumber(event) {
    const { target } = event;
    this.setState(state => ({
      ...state,
      votes: target.value
    }));
  }

  setChoice({ value }) {
    this.setState(state => ({
      ...state,
      choice: value
    }));
  }

  prepareScript() {
    const { proposal } = this.props;
    const { yesBoxAddress, noBoxAddress } = proposal;
    const hexId = toHex(proposal.proposalId, 12);

    // Bytecode templates
    const {
      VOICE_CREDITS,
      VOICE_TOKENS,
      BALANCE_CARD,
      YES_BOX,
      NO_BOX,
      PROPOSAL_ID
    } = template;

    // VOLT related addresses
    const {
      CONTRACT_VOICE_CREDITS,
      CONTRACT_VOICE_TOKENS,
      CONTRACT_VOICE_BALANCE_CARD
    } = voltConfig;

    // Replace all the placeholders with real data
    let finalBytecode = replaceAll(
      bytecode,
      VOICE_CREDITS,
      CONTRACT_VOICE_CREDITS
    );
    finalBytecode = replaceAll(
      finalBytecode,
      VOICE_TOKENS,
      CONTRACT_VOICE_TOKENS
    );
    finalBytecode = replaceAll(
      finalBytecode,
      BALANCE_CARD,
      CONTRACT_VOICE_BALANCE_CARD
    );
    finalBytecode = replaceAll(finalBytecode, YES_BOX, yesBoxAddress);
    finalBytecode = replaceAll(finalBytecode, NO_BOX, noBoxAddress);

    finalBytecode = replaceAll(finalBytecode, PROPOSAL_ID, hexId);
    return Buffer.from(finalBytecode, "hex");
  }

  async getBalanceCard(address) {
    // Balance Card
    const { BALANCE_CARD_COLOR } = voltConfig;
    const balanceCards = await getUTXOs(plasma, address, BALANCE_CARD_COLOR);
    const balanceCard = balanceCards[0];

    return {
      id: getId(balanceCard),
      unspent: balanceCard
    };
  }

  async getVoteCredits(address) {
    const { VOICE_CREDITS_COLOR } = voltConfig;
    const voiceCreditsUTXOs = await getUTXOs(
      plasma,
      address,
      VOICE_CREDITS_COLOR
    );

    // TODO: We can put all UTXO here for consolidation
    return {
      unspent: voiceCreditsUTXOs[0]
    };
  }

  async getGas(address) {
    // Gas is always paid in Leap tokens (color = 0)
    const LEAP_COLOR = 0;
    const gasUTXOs = await getUTXOs(plasma, address, LEAP_COLOR);
    // TODO: Do we need to get several here?
    const gas = gasUTXOs[0];
    return {
      unspent: gas
    };
  }

  async getVoteTokens(address) {
    const { VOICE_TOKENS_COLOR } = voltConfig;
    const voiceTokensUTXOs = await getUTXOs(
      plasma,
      address,
      VOICE_TOKENS_COLOR
    );

    // TODO: Pick enough outputs
    const voiceTokensOutput = voiceTokensUTXOs[0];

    return {
      unspent: voiceTokensOutput
    };
  }

  async getOutputs() {
    const { account, proposal } = this.props;
    const { boothAddress } = proposal;

    // TODO: Parallelize with Promise.all([...promises])
    const gas = await this.getGas(boothAddress);
    const voteTokens = await this.getVoteTokens(boothAddress);
    const balanceCard = await this.getBalanceCard(account);
    const voteCredits = await this.getVoteCredits(account);

    return {
      gas,
      voteTokens,
      balanceCard,
      voteCredits
    };
  }

  cookVoteParams(balanceCardId) {
    const { account, proposalId } = this.props;
    const { votes, choice } = this.state;

    // Implement NO vote with negative value
    const sign = choice === "Yes" ? 1 : -1;

    let tree;
    let castedVotes;

    let localTree = getStoredValue("votes", account);

    if (!localTree) {
      console.log("local tree is empty");
      tree = new SMT(9);
      castedVotes = padHex("0x0", 64);
    } else {
      console.log({ localTree });
      const parsedTree = JSON.parse(localTree);
      console.log({ parsedTree });
      tree = new SMT(9, parsedTree);
      castedVotes = parsedTree[proposalId];
      console.log("Tree root:", tree.root);
    }
    const proof = tree.createMerkleProof(0);

    const prevNumOfVotes = utils.parseEther("1".toString()); // get this one from tree
    const newNumOfVotes = utils.parseEther("2".toString()); // this prevNum and new votes

    const { abi } = votingBoothArtifact;
    const contractInterface = new utils.Interface(abi);

    return contractInterface.functions.castBallot.encode([
      parseInt(balanceCardId, 10),
      proof,
      prevNumOfVotes, // previous value
      newNumOfVotes // how much added
    ]);
  }

  async constructVote(outputs, script, data) {
    const { gas, voteTokens, balanceCard, voteCredits } = outputs;

    const vote = Tx.spendCond(
      [
        new Input({
          prevout: gas.unspent.outpoint,
          script
        }),
        new Input({
          prevout: voteTokens.unspent.outpoint
        }),
        new Input({
          prevout: balanceCard.unspent.outpoint
        }),
        new Input({
          prevout: voteCredits.unspent.outpoint
        })
      ],
      // Outputs is empty, cause it's hard to guess what it should be
      []
    );

    vote.inputs[0].setMsgData(data);

    return vote;
  }

  async signVote(vote) {
    const { metaAccount, web3 } = this.props;
    if (metaAccount && metaAccount.privateKey) {
      // TODO: Check that this is working on mobile, where you don't have Metamask
      vote.sign([
        undefined,
        undefined,
        metaAccount.privateKey,
        metaAccount.privateKey,
      ]);
    } else {
      await window.ethereum.enable();
      const { r, s, v, signer } = await Tx.signMessageWithWeb3(web3, vote.sigData(), 0);
      vote.inputs[2].setSig(r, s, v, signer);
      vote.inputs[3].setSig(r, s, v, signer);
    }
  }

  async checkVote(vote) {
    return await plasma.send("checkSpendingCondition", [vote.hex()]);
  }

  async processVote(vote) {
    const plasmaWeb3 = helpers.extendWeb3(new Web3(RPC));
    const receipt = await plasmaWeb3.eth.sendSignedTransaction(vote.hex());
    return receipt;
  }

  async submitVote() {
    console.log("Display Progress Screen");
    this.setProgressState(true);

    /// START NEW CODE

    const script = this.prepareScript();
    const outputs = await this.getOutputs();
    const { balanceCard } = outputs;
    const data = this.cookVoteParams(balanceCard.id);
    const vote = await this.constructVote(outputs, script, data);

    console.log({ vote });

    // Sign and check vote
    await this.signVote(vote);
    const check = await this.checkVote(vote);
    console.log({ check });

    if (check.error) {
      throw new Error(`Check error: ${check.error}`);
    }

    // Update vote and sign again
    vote.outputs = check.outputs.map(Output.fromJSON);
    await this.signVote(vote);
    const secondCheck = await this.checkVote(vote);
    console.log({ secondCheck });

    this.setProgressState(false);
    this.setReceiptState(true);

    // Submit vote to blockchain
    // const receipt = await this.processVote(vote);

    // TODO: Update local SMT
    // TODO: Show receipt
  }

  async withdrawVote() {
    console.log("Display Progress Screen");
    this.setProgressState(true);
  }

  setProgressState(bool) {
    this.setState(state => ({
      ...state,
      showProgress: bool
    }));
  }

  setReceiptState(bool) {
    this.setState(state => ({
      ...state,
      showReceipt: bool
    }));
  }

  resetState() {
    this.setState(() => ({
      expanded: false,
      votes: 0,
      choice: "",
      showProgress: false,
      showReceipt: false
    }));
  }

  collapse() {
    this.setState(state => {
      return {
        ...state,
        expanded: false
      };
    });
  }

  expand() {
    this.setState(state => {
      return {
        ...state,
        expand: true
      };
    });
  }

  render() {
    const { expanded, votes, choice } = this.state;
    const { showReceipt, showProgress } = this.state;
    const { credits } = this.props;
    const max = Math.floor(Math.sqrt(credits)) || 0;
    const options = [
      { value: "yes", color: "voltBrandGreen" },
      { value: "no", color: "voltBrandRed" }
    ];
    const disabled = votes < 1 || choice === "";
    return (
      <Container>
        {showProgress && <Progress />}
        {showReceipt && (
          <Receipt voteType={choice} votes={votes} onClose={this.resetState} />
        )}
        <Equation votes={votes} />
        <StyledSlider
          min={0}
          max={max}
          steps={max + 1}
          value={votes}
          onChange={this.setTokenNumber}
        />
        <SliderLabels>
          <Label>0</Label>
          <Label>{max}</Label>
        </SliderLabels>
        <Choice
          options={options}
          selection={choice}
          onChange={this.setChoice}
        />
        <ActionButton disabled={disabled} onClick={this.submitVote}>
          Send Vote
        </ActionButton>
        <ActionButton onClick={this.withdrawVote}>
          Withdraw
        </ActionButton>
      </Container>
    );
  }
}

export default VoteControls;
