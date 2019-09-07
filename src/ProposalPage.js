import React from 'react';
import { useRef, useEffect, useState } from "react";
import styled from 'styled-components';
import { Flex, Box } from "rimble-ui";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import "dayjs/locale/de";

import { Star, Back } from "./volt/components/Common";
import { TopPart, Topic, ProposalId } from "./volt/components/ProposalsList/SingleProposal/styles";
import VoteControls from "./volt/components/VoteControls";
import { ActionButton } from "./volt/components/VoteControls/styles";
import BB from './volt/components/BB';

dayjs.locale("de");
dayjs.extend(relativeTime);

const VoteButton = styled(ActionButton)`
  width: auto;
  padding-left: 50px;
  padding-right: 50px;
`;

const Container = styled(Flex).attrs({
  flexDirection: 'column',
})`
  flex: 1;
  height: 100%;

  // Enable smooth scrolling on mobile
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;

export const Footer = styled(Flex).attrs(() => ({
  p: 3,
  width: "100%",
  bg: "voltBrandMain",
  color: "voltBrandWhite",
  alignItems: "center",
  justifyContent: "center"
}))`
  flex-shrink: 0;
  flex-direction: column;
  border-radius: 5px 5px 0 0;
`;

export const VoteFooter = styled(Flex).attrs(() => ({
  pt: 5,
  pb: 5,
}))`
`;

const HeaderBar = styled(Flex).attrs({
  justifyContent: 'space-between',
  pt: 3,
  pb: 3,
})``;

const Content = styled(Box).attrs({
  p: 3,
  pt: 0,
})`
  height: 100%;
  overflow-y: auto;
  /* br {
    display: none;
  } */
`;

export default function ProposalPage({
  proposal,
  toggleFavorites,
  favorite,
  creditsBalance,
  goBack,
  web3Props,
  changeAlert,
  updateVotes,
  voteStartTime,
  voteEndTime,
  history
}) {
  const [showVoteControls, setShowVoteControls] = useState(null);
  const ref = useRef(null);

  const handleClickOutside = React.useCallback((event) => {
    if (ref.current && ref.current.contains && !ref.current.contains(event.target)) {
      setShowVoteControls(false);
    }
  }, [setShowVoteControls, ref])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <Container>
      <Content as="article">
        <HeaderBar as="nav">
          <Back onClick={goBack}/>
          <Star active={favorite} onClick={()=> toggleFavorites(proposal.proposalId)}/>
        </HeaderBar>

        <header>
          <TopPart>
            <ProposalId>{proposal.proposalId}</ProposalId>
            {proposal.topic.map((t, i) => <Topic key={i}>{t}</Topic>)}
          </TopPart>
          <h1>{proposal.title}</h1>
        </header>
        <BB as="main">{proposal.description}</BB>
      </Content>

      <div ref={ref}>
        <Footer as="footer">
          {showVoteControls &&
            <VoteControls
              proposal={proposal}
              proposalId={proposal.id}
              credits={creditsBalance}
              changeAlert={changeAlert}
              updateVotes={updateVotes}
              history={history}
              {...web3Props}
            />
          }
          {!showVoteControls &&
            <VoteFooter>
              <VoteButton
                disabled={dayjs().isBefore(voteStartTime) || dayjs().isAfter(voteEndTime)}
                onClick={() => setShowVoteControls(true) }>
              {dayjs().isBefore(voteStartTime) ? `VOTE STARTET ${dayjs().to(dayjs(voteStartTime))}`.toUpperCase() : dayjs().isAfter(voteEndTime) ? "VOTE GESCHLOSSEN" : "JETZT VOTEN"}
              </VoteButton>
            </VoteFooter>
          }
        </Footer>
      </div>
    </Container>
  );
}
