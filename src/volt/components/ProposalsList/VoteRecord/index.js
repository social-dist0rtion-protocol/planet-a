import React from "react";
import { VoteContainer, Votes, VotesCredits } from "./styles";

const VoteRecord = props => {
  const { votes } = props;
  const votesCredits = votes ** 2;
  const votesValue = Math.abs(votes);
  return (
    <VoteContainer votes={votes}>
      <Votes>{votesValue}</Votes>
      <VotesCredits>{votesCredits}</VotesCredits>
    </VoteContainer>
  );
};

export default VoteRecord;
