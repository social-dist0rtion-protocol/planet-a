import React from 'react';
import styled from "styled-components";
import Ruler from "./Ruler";
import i18n from '../i18n';
import { Flex } from 'rimble-ui';
import { PrimaryButton, OutlineButton } from "../volt/components/VoteControls/styles";

const DangerousButton = styled(PrimaryButton)`
  background-color: #c53838;
  color: white;
`;

const Container = styled(Flex).attrs({
  flexDirection: 'column',
})`
  padding: 50px;
  flex: 1;
  height: 100%;
`;

export default ({ mainStyle, burnWallet, goBack }) => {
  return (
    <Container>
      <div style={{textAlign:"center",width:"100%",fontWeight:'bold',fontSize:30}}>
        {i18n.t('burn_wallet.burn_private_key_question')}
      </div>
      <div style={{textAlign:"center",marginTop:20,width:"100%",fontWeight:'bold',fontSize:20}}>
        {i18n.t('burn_wallet.disclaimer')}
      </div>
      <div>
        <Ruler/>
        <div className="content ops row">

            <div className="col-6 p-1">
              <OutlineButton onClick={goBack} >
                  <i className="fas fa-arrow-left"  /> {i18n.t('burn_wallet.cancel')}
              </OutlineButton>
            </div>

          <div className="col-6 p-1">
            <DangerousButton onClick={burnWallet}>
                <i className="fas fa-fire"/> {i18n.t('burn_wallet.burn')}
            </DangerousButton>
          </div>
        </div>
      </div>

    </Container>
  )
}
