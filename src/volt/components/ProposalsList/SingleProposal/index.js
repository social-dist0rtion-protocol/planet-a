import React from "react";
import { Star } from "../../Common";
import VoteRecord from "../VoteRecord";
import {
  ProposalContainer,
  VoteInfo,
  TopPart,
  ProposalId,
  Topic,
  Title
} from "./styles";

const SingleProposal = props => {
  //const { votes } = props;
  const { title, proposalId, toggle, favorite } = props;
  // const { favorite } = props;
  const topic = "Smart State";
    // Math.random() > 0.3 ? "yes" : Math.random() > 0.5 ? "no" : "empty";
  const sign = Math.random() > 0.5 ? 1 : -1;
  const votes = sign * Math.floor(Math.random() * 6);
  return (
    <ProposalContainer>
      <VoteRecord votes={votes} />
      <VoteInfo>
        <TopPart>
          <ProposalId>{proposalId}</ProposalId>
          <Topic>{topic}</Topic>
        </TopPart>
        <Title>{title}</Title>
      </VoteInfo>
      <Star active={favorite} onClick={()=> toggle(proposalId)}/>
    </ProposalContainer>
  );
};

export default SingleProposal;
