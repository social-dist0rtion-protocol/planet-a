import React from "react";
import { Link } from 'react-router-dom';
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
  const { title, proposalId, toggle, favorite } = props;
  const topic = "Smart State";
  const votes = 0;
  return (
    <ProposalContainer>
      <VoteRecord votes={votes} />
      <VoteInfo as={Link}  to={`/proposal/${proposalId}`}>
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

export default React.memo(SingleProposal);
