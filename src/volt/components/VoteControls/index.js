import React, { Component } from "react";
import { Tx, Input, Output } from "leap-core";
import SMT from "../../lib/SparseMerkleTree";

import { Equation } from "./GridDisplay";
import { Choice } from "./Choice";
import {
  SliderLabels,
  Container,
  Label,
  StyledSlider,
  ActionButton
} from "./styles";
import proposals from "../../proposals";
import { votesToValue, getUTXOs } from "../../utils";
import { abi, bytecode } from "../../contracts/voteBooth";
import { voltConfig } from "../../config";
import {getId} from "../../../services/plasma";

class VoteControls extends Component {
  constructor(props) {
    console.log(props.account);
    super(props);
    this.state = {
      expanded: false,
      votes: 0,
      choice: ""
    };
    this.collapse = this.collapse.bind(this);
    this.expand = this.expand.bind(this);
    this.setTokenNumber = this.setTokenNumber.bind(this);
    this.setChoice = this.setChoice.bind(this);
    this.submit = this.submit.bind(this);
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

  async submit() {
    const { account, plasma } = this.props;
    const { choice, votes } = this.state;
    console.log(`Submit Choice: ${votes} for ${choice} from ${account}`);
    const { hex, string } = votesToValue(votes);
    const sign =  choice === "Yes" ? 1 : -1;
    const voiceCredits = sign * votes * 10 ** 18;

    const { boothAddress } = proposals[0];
    const balanceCardColor = voltConfig.BALANCE_CARD_COLOR;
    const balanceCardAddress = voltConfig.CONTRACT_VOICE_BALANCE_CARD;
    const balanceCards = await plasma.getUnspent(account, balanceCardColor);
    console.log({balanceCards});
    const balanceCard = balanceCards[0];
    const balanceCardId = getId(balanceCard);

    const voiceCreditsColor = voltConfig.VOICE_CREDITS_COLOR;
    const voiceCreditsUTXOs = await plasma.getUnspent(account, voiceCreditsColor);
    console.log({voiceCreditsUTXOs});

    // TODO: Do we need to get several here?
    const gasUTXOs = await plasma.getUnspent(boothAddress, 0);
    console.log(gasUTXOs);
    const gas = gasUTXOs[0];
    const script = Buffer.from(bytecode, "hex");

    const condition = Tx.spendCond(
      [
        new Input({
          prevout: gas.outpoint,
          script
        }),
        new Input({
          prevout: balanceCard.outpoint
        }),
        new Input({
          prevout: voiceCreditsUTXOs[1].outpoint // HARDCODED, FIX TO PROPER SOLUTION!
        })
      ],
      [
        // Empty for now, we can always get them back from check
      ]
    );

    // TODO: Read SMT from local storage
    const tree = new SMT(9);
    const proof = tree.createMerkleProof(0);

    const data = plasma.eth.abi.encodeParameters(
      ["uint256", "bytes", "int256", "int256"],
      [ balanceCardId, proof, votes, 0 ] //
    );

    condition.inputs[0].setMsgData(data);

    // TODO: Sign transaction here
    // TODO: Check Spending Condition
    // TODO: Update outputs accordingly
    // TODO: Submit transition to blockchain
    // TODO: Update local SMT
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
    const { credits } = this.props;
    const max = Math.floor(Math.sqrt(credits)) || 0;
    const options = [
      { value: "Yes", color: "voltBrandGreen" },
      { value: "No", color: "voltBrandRed" }
    ];
    const disabled = votes < 1 || choice === "";
    return (
      <Container>
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
        <ActionButton disabled={disabled} onClick={this.submit}>
          Send Vote
        </ActionButton>
      </Container>
    );
  }
}

export default VoteControls;
