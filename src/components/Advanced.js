import React from 'react';
import { Scaler } from "dapparatus";
import { CopyToClipboard } from "react-copy-to-clipboard";
import i18n from '../i18n';
import {
  Input,
  QR as QRCode,
  Text,
  Select,
  Flex,
  Checkbox
} from 'rimble-ui'
import { PrimaryButton, BorderButton } from '../components/Buttons'
import getConfig from '../config'
import { getStoredValue, storeValues } from "../services/localStorage";

const { CURRENCY } = getConfig()

export default class Advanced extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      privateKeyQr:false,
      seedPhraseHidden:true,
      privateKeyHidden:true,
      currency: '',
      expertMode:false
    }
    this.updateCurrency = this.updateCurrency.bind(this)
  }

  componentDidMount() {
    const { address } = this.props;
    const currency = getStoredValue('currency', address) || CURRENCY.DEFAULT_CURRENCY;
    const expertMode = getStoredValue("expertMode") === "true"
      // Right now "expertMode" is enabled by default. To disable it by default, remove the following line.
      || getStoredValue("expertMode") === null;
    this.setState({ currency, expertMode })
  }

  updateCurrency = e => {
    const { address } = this.props;
    let { value } = e.target
    this.setState({ currency: value })
    storeValues({ currency: value }, address)
  }

  updateExpertMode = e => {
    let { checked } = e.target
    this.setState({ expertMode: checked })
    storeValues({ expertMode: checked })
  }

  render(){
    let {isVendor, balance, privateKey, changeAlert, changeView, setPossibleNewPrivateKey} = this.props
    let { currency, expertMode } = this.state

    let url = window.location.protocol+"//"+window.location.hostname
    if(window.location.port&&window.location.port!==80&&window.location.port!==443){
      url = url+":"+window.location.port
    }
    let qrSize = Math.min(document.documentElement.clientWidth,512)-90
    let qrValue = url+"/#"+privateKey
    let privateKeyQrDisplay = ""
    if(this.state.privateKeyQr){
      privateKeyQrDisplay = (
        <div className="main-card card w-100">
          <div className="content qr row">
            <QRCode className="qr-code" value={qrValue} size={qrSize}/>
          </div>
        </div>
      )
    }


    let inputPrivateEyeButton = ""

    if(this.state.newPrivateKey){
      inputPrivateEyeButton = (
        <PrimaryButton className="show-toggle" onClick={()=>{this.setState({privateKeyHidden:!this.state.privateKeyHidden})}}>
          <i className="fas fa-eye"></i>
        </PrimaryButton>
      )
    }

    let inputPrivateKeyRow = (
      <div className="content ops row settings-row">
        <div className="input-with-toggle">
          <Input
            type={this.state.privateKeyHidden?"password":"text"}
            autocorrect="off"
            autocapitalize="none"
            className="form-control settings-input"
            placeholder="private key"
            value={this.state.newPrivateKey}
            onChange={event => this.setState({newPrivateKey:event.target.value})}
          />
          {inputPrivateEyeButton}
        </div>
        <PrimaryButton onClick={()=>{
          console.log(this.state.newPrivateKey)
          if(this.state && this.state.newPrivateKey && this.state.newPrivateKey.length>=64&&this.state.newPrivateKey.length<=66){
            //let pkutils = require("ethereum-mnemonic-privatekey-utils")
            //const newPrivateKey = pkutils.getPrivateKeyFromMnemonic(newPrivateKey)
            changeView('main')
            let possibleNewPrivateKey = this.state.newPrivateKey
            if(possibleNewPrivateKey.indexOf("0x")!==0){
              possibleNewPrivateKey = "0x"+possibleNewPrivateKey
            }
            setPossibleNewPrivateKey(possibleNewPrivateKey)
          }else{
            changeAlert({type: 'warning', message: 'Invalid private key.'})
          }
        }}>
          <i className="fas fa-plus-square"/> {i18n.t('create')}
        </PrimaryButton>
      </div>
    )


    let inputSeedEyeButton = ""

    if(this.state.newSeedPhrase){
      inputSeedEyeButton = (
        <PrimaryButton width={1} onClick={()=>{this.setState({seedPhraseHidden:!this.state.seedPhraseHidden})}}>
          <i className="fas fa-eye"></i>
        </PrimaryButton>
      )
    }

    let inputSeedRow = (
      <div className="content ops row settings-row" style={{paddingTop:10}}>
        <Input
          type={this.state.seedPhraseHidden?"password":"text"}
          autocorrect="off"
          autocapitalize="none"
          className="form-control"
          placeholder="seed phrase"
          value={this.state.newSeedPhrase}
          onChange={event => this.setState({newSeedPhrase:event.target.value})}
        />
        {inputSeedEyeButton}
        <PrimaryButton width={1} onClick={()=>{
          if(!this.state.newSeedPhrase){
            changeAlert({type: 'warning', message: 'Invalid seed phrase.'})
          }else{
            import('ethereum-mnemonic-privatekey-utils').then(pkutils => {
              console.log(pkutils);
              const newPrivateKey = pkutils.getPrivateKeyFromMnemonic(this.state.newSeedPhrase)
              changeView('main')
              setPossibleNewPrivateKey("0x"+newPrivateKey)
            });
          }
        }}>
          <Scaler config={{startZoomAt:400,origin:"50% 50%"}}>
            <i className="fas fa-plus-square"/> {i18n.t('create')}
          </Scaler>
        </PrimaryButton>
      </div>
    )

    return (
      <div style={{marginTop:20}}>
        {/* NOTE: We don't need this functionality in Planet A. If we wanted to
            properly remove it, that would mean "cleaning" this component from
            any unused variables. Instead however, we're just setting these
            options to display: none to guarantee that they don't break
            any functionality.
        */}
        <div style={{display: "none"}}>
          <Flex py={3} alignItems='center' justifyContent='space-between'>
            <Text>{i18n.t('currency.label')}</Text>
            <Select items={CURRENCY.CURRENCY_LIST} onChange={this.updateCurrency} value={currency}/>
          </Flex>
          <Flex py={3} alignItems='center' justifyContent='space-between'>
            <Text>Enable advanced features</Text>
            <Checkbox onChange={this.updateAdvancedBalance} checked={expertMode} />
          </Flex>
          <hr style={{paddingTop:20}}/>
        </div>
        <div>
          <div style={{width:"100%",textAlign:"center"}}><h5>Learn More</h5></div>
          <div className="content ops row settings-row" style={{marginBottom:10}}>
            <a href="https://github.com/social-dist0rtion-protocol/planet-a" style={{color:"#FFFFFF"}} target="_blank" rel="noopener noreferrer">
              <BorderButton width={1}>
                <Scaler config={{startZoomAt:400,origin:"50% 50%"}}>
                  <i className="fas fa-code"/> {i18n.t('code')}
                </Scaler>
              </BorderButton>
            </a>
            {/* NOTE: Added presentation of Planet A as "About" for now.
                Once we have a better resource, we should replace this
              */}
            <a href="https://docs.google.com/presentation/d/1zjhVQMqVYKIzXUOKR83o5jbo97BRb60XqG6_OwnJOlw/edit" style={{color:"#FFFFFF"}} target="_blank" rel="noopener noreferrer">
              <BorderButton width={1}>
                <Scaler config={{startZoomAt:400,origin:"50% 50%"}}>
                  <i className="fas fa-info"/> {i18n.t('about')}
                </Scaler>
              </BorderButton>
            </a>
          </div>
        </div>

        <hr style={{paddingTop:20}}/>

        {privateKey && !isVendor &&
        <div>
          <div style={{width:"100%",textAlign:"center"}}>
            <h5>Private Key</h5>
          </div>
          <div className="content ops row settings-row" style={{marginBottom:10}}>
            <PrimaryButton width={1} onClick={()=>{
              this.setState({privateKeyQr:!this.state.privateKeyQr})
            }}>
              <i className="fas fa-key"/> {i18n.t('show')}
            </PrimaryButton>

            <CopyToClipboard text={privateKey}>
              <PrimaryButton width={1} onClick={() => changeAlert({type: 'success', message: 'Private Key copied to clipboard'})}>
                <i className="fas fa-key"/> {i18n.t('copy')}
              </PrimaryButton>
            </CopyToClipboard>

          </div>
          {privateKeyQrDisplay}

        </div>
        }

        {privateKey &&
        <div>
          <div className="content ops row settings-row" >
            <PrimaryButton width={1} onClick={()=>{
              console.log("BALANCE",balance)
              changeView('burn-wallet')
            }}>
              <Scaler config={{startZoomAt:400,origin:"50% 50%"}}>
                <i className="fas fa-fire"/> {i18n.t('burn')}
              </Scaler>
            </PrimaryButton>
          </div>
          <hr style={{paddingTop:20}}/>
        </div>}


        <div style={{width:"100%",textAlign:"center"}}><h5>Create Account</h5></div>

        {inputPrivateKeyRow}

        {inputSeedRow}

        {isVendor &&
        <div>
          <div className="content ops row settings-row" style={{marginBottom:10}}>
            <PrimaryButton width={1} onClick={()=>{
              this.props.changeView("exchange")
            }}>
              <Scaler config={{startZoomAt:400,origin:"50% 50%"}}>
                <i className="fas fa-key"/> {"Exchange"}
              </Scaler>
            </PrimaryButton>
          </div>
        </div>
        }

        {expertMode && (
          <>
            <hr />
            <Flex py={3} alignItems="center" justifyContent="space-between">
              <Text>Swap "Play Fair" and "Play Greedy" in the handshake dialog.</Text>
              <Checkbox onChange={this.updateExpertMode} checked={expertMode} />
            </Flex>
          </>
        )}

      </div>
    )
  }
}
