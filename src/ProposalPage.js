import React from 'react';
import styled from 'styled-components';
import { Flex, Box } from "rimble-ui";

import { Star, Back } from "./volt/components/Common";
import { TopPart, Topic, ProposalId } from "./volt/components/ProposalsList/SingleProposal/styles";
import VoteControls from "./volt/components/VoteControls";
import { ActionButton } from "./volt/components/VoteControls/styles";
import BB from './volt/components/BB';

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
`;

export const Footer = styled(Flex).attrs(() => ({
  p: 3,
  width: "100%",
  bg: "voltBrandMain",
  color: "voltBrandWhite",
  alignItems: "center",
  justifyContent: "center"
}))`
  /* position: fixed;
  bottom: 0;
  z-index: 2; */
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

export default class ProposalPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showVoteControls: false,
    };
  }
  render() {
    const { showVoteControls } = this.state;
    const {
      proposal,
      toggleFavorites,
      favorite,
      creditsBalance,
      goBack,
      web3Props,
    } = this.props;

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
              <Topic>Smart state</Topic>
            </TopPart>
            <h1>{proposal.title}</h1>
          </header>
          <BB as="main">{proposal.description}</BB>
        </Content>

        <Footer as="footer">
          {showVoteControls &&
            <VoteControls
              proposal={proposal}
              credits={creditsBalance}
              {...web3Props}
            />
          }

          {!showVoteControls &&
            <VoteFooter>
              <VoteButton onClick={() => {
                this.setState({ showVoteControls: true })
              }}>JETZT VOTEN</VoteButton>
            </VoteFooter>
          }
        </Footer>

      </Container>
    );
  }
}