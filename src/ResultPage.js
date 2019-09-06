import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Flex } from "rimble-ui";
import { bi, divide } from "jsbi-utils";
import { ProposalContainer,
  VoteInfo,
  TopPart,
  ProposalId,
  Topic,
  Title } from './volt/components/ProposalsList/SingleProposal/styles';
import { voltConfig } from "./volt/config";

const Container = styled(Flex).attrs({
  flexDirection: 'column',
})`
  flex: 1;
  height: 100%;

  ul {
    height: 100%;
    overflow-y: auto;
    padding: 0;
  }
`;

const Votes = styled(Flex).attrs(() => ({
  flexDirection: 'column',
  alignItems: 'stretch',
}))`
  width: 40px;
`;

const Vote = styled.div`
  position: relative;
  color: ${({ type }) => type < 0 ? '#ff0000' : '#00d089'};
  text-align: center;

  & + &::before {
    top: 0;
    left: 0;
    width: 100%;
    height: 0;
    border-top: 1px solid #582b83;
    border-bottom: 1px solid #582b83;
    content: '';
    position: absolute;
  }
`;

const ERC20 = [
  {
      "constant": true,
      "inputs": [
          {
              "name": "_owner",
              "type": "address"
          }
      ],
      "name": "balanceOf",
      "outputs": [
          {
              "name": "balance",
              "type": "uint256"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  }
];

export default function ResultPage({ proposals = [], web3Props }) {
  const [balances, setBalances] = React.useState(null);
  React.useEffect(() => {
    if (proposals.length) {
      const promises = [];
      const balances = {};
      const contract = new web3Props.plasma.eth.Contract(ERC20, voltConfig.CONTRACT_VOICE_TOKENS);
      const batch = new web3Props.plasma.BatchRequest();
      proposals.forEach(({ proposalId, yesBoxAddress, noBoxAddress }) => {
        promises.push(new Promise((resolve) => {
          const balance = {};
          const setBalance = (key) => (_, result) => {
            balance[key] = Number(divide(bi(result), bi(10 ** 18)).toString());
            if (balance.yes !== undefined && balance.no !== undefined) {
              balances[proposalId] = balance;
              resolve();
            }
          };
          batch.add(contract.methods.balanceOf(yesBoxAddress).call.request(setBalance('yes')));
          batch.add(contract.methods.balanceOf(noBoxAddress).call.request(setBalance('no')));
        }));
      });

      batch.execute();

      Promise.all(promises).then(() => {
        setBalances(balances);
      });
    }
  }, [proposals, setBalances]);

  const getYes = ({ proposalId }) => balances[proposalId].yes;
  const getNo = ({ proposalId }) => balances[proposalId].no;

  return <Container>
    {!balances && 'Loading...'}
    {balances && (
      <ul>
        {proposals
          .sort((a, b) => (getYes(b) + getNo(b)) - (getYes(a) + getNo(a)))
          .map(proposal => (
            <ProposalContainer as="li" key={proposal.proposalId}>
              <VoteInfo as={Link} to={`/proposal/${proposal.proposalId}`}>
                <TopPart>
                  <ProposalId>{proposal.proposalId}</ProposalId>
                  {proposal.topic.map((t, i) => <Topic key={i}>{t}</Topic>)}
                </TopPart>
                <Title>{proposal.title}</Title>
              </VoteInfo>
              <Votes>
                <Vote type={1}>{getYes(proposal)}</Vote>
                <Vote type={-1}>{getNo(proposal)}</Vote>
              </Votes>
            </ProposalContainer>
          ))
        }
      </ul>
    )}
  </Container>;
}