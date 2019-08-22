import React from 'react';
import cookie from 'react-cookies'
import {CopyToClipboard} from "react-copy-to-clipboard";
import Blockies from 'react-blockies';
import { scroller } from 'react-scroll'
import i18n from '../i18n';
import queryString from 'query-string';
import {
  Box,
  Field,
  Input,
} from 'rimble-ui';
import { PrimaryButton, BorderButton } from "./Buttons";
import { getStoredValue } from "../services/localStorage";

export default class SendToAddress extends React.Component {

  constructor(props) {
    super(props);

    console.log("!!!!!!!!!!!!!!!!!!!!!!!! window.location.search",window.location.search)

    let initialState;
    if (props.scannerState) {
      const {
        scannerState: {
          message,
          extraMessage,
          toAddress,
        },
        convertCurrency,
        changeAlert,
        address,
      } = props;


      let { scannerState: { amount, currency } } = props;
      let currencyWarning = false;
      let requestedAmount = "";

      // NOTE: Two users could have different display currencies, which is why
      // at this point we'll have to adjust the requested amount for the user
      // sending money.
      const displayCurrency = getStoredValue("currency", address);

      // NOTE: In this case, we simply scan the "Receive" QR code
      if (toAddress && !currency && !amount && !message) {
        // NOTE: We're setting currency equal to displayCurrency here to not
        // trigger the next condition, as that would set currencyWarning to
        // true again.
        currency = displayCurrency;

      // NOTE: In this case, we scan the RequestFunds QR code and if "currency"
      // is missing, we display a warning.
      } else if (((toAddress && amount) || message) && !currency) {
        changeAlert({type: "warning", message: i18n.t("send_to_address.currency_error")});
        // NOTE: We're setting currency equal to displayCurrency here to not
        // trigger the next condition, as that would set currencyWarning to
        // true again.
        currency = displayCurrency;
      } else if (currency !== displayCurrency) {
        requestedAmount = amount;
        amount = convertCurrency(amount, `${displayCurrency}/${currency}`)
                  .toFixed(2);
        currencyWarning = true;
      }

      initialState = {
        amount,
        requestedAmount,
        message,
        extraMessage,
        toAddress,
        currency,
        currencyWarning,
        displayCurrency
      }
    } else {
      const { amount, message, extraMessage } = props
      initialState = {
        amount: amount,
        message: message,
        extraMessage: extraMessage,
        toAddress: ""
      }
    }


    initialState.fromEns = ""
    initialState.canSend = false

    if(window.location.pathname){
      if(window.location.pathname.length===43){
        initialState.toAddress = window.location.pathname.substring(1)
      }else if(window.location.pathname.length>40) {
      //    console.log("window.location.pathname",window.location.pathname)
      //  console.log("parseAndCleanMyAss...")
        initialState = Object.assign(initialState,this.props.parseAndCleanMyAss(window.location.pathname))
      //  console.log("parseAndCleanMyAss:",initialState)
      }
    }

    const parsed = queryString.parse(window.location.search);
    if(parsed){
      initialState.params = parsed
    }

    this.state = initialState
    //console.log("SendToAddress constructor",this.state)
    window.history.pushState({},"", "/");
  }

  componentWillReceiveProps(newProps) {
    if (this.props.scannerState !== newProps.scannerState) {
       this.setState({
          ...this.state,
          ...newProps.scannerState
        })
    }
  }

  updateState = async (key, value) => {
    this.setState({ [key]: value },()=>{
      this.setState({ canSend: this.canSend() },()=>{
        if(key!=="message"){
          this.bounceToAmountIfReady()
        }
      })
    });
    if(key==="toAddress"){
      this.setState({fromEns:""})
      //setTimeout(()=>{
      //  this.scrollToBottom()
      //},30)
    }
  };
  bounceToAmountIfReady(){
    if(this.state.toAddress && this.state.toAddress.length === 42){
      this.amountInput.focus();
    }
  }
  componentDidMount(){
    this.setState({ canSend: this.canSend() })
    this.bounceToAmountIfReady();
  }

  canSend() {
    const { toAddress, amount, message } = this.state;
    return (toAddress && toAddress.length === 42 && (amount>0 || message))
  }

  scrollToBottom(){
    scroller.scrollTo('theVeryBottom', {
      duration: 500,
      delay: 30,
      smooth: "easeInOutCubic",
    })
  }

  send = async () => {
    let { toAddress, amount } = this.state;

    // Disable conversion, since we are sending DAI
    // const displayCurrency = getStoredValue("currency", address);
    // amount = convertCurrency(amount, `USD/${displayCurrency}`);

    if(this.state.canSend){

      if(parseFloat(this.props.balance) <= 0){
        this.props.changeAlert({type: 'warning', message: "No Funds."})
          // NOTE: We don't i18nParseFloat here as we already expect it to be
          // a float when it's set as state and converted by the convertCurrency
          // method
      }else if(parseFloat(this.props.balance) < parseFloat(amount)){
        this.props.changeAlert({type: 'warning', message: `Not enough funds: ${this.props.balance}`})
      }else{
        console.log("SWITCH TO LOADER VIEW...",amount)
        this.props.changeView('loader_SIDECHAIN')
        setTimeout(()=>{window.scrollTo(0,0)},60)

        console.log("web3",this.props.web3)
        let txData
        if(this.state.message){
          txData = this.props.web3.utils.utf8ToHex(this.state.message)
        }
        console.log("txData",txData)
        let value = 0
        console.log("amount",amount)
        if(amount){
          value=amount
        }

        cookie.remove('sendToStartAmount', { path: '/' })
        cookie.remove('sendToStartMessage', { path: '/' })
        cookie.remove('sendToAddress', { path: '/' })

        this.props.send(toAddress, value, 120000, txData, (err, result) => {
          if(result && result.hash){
            this.props.goBack();
            window.history.pushState({},"", "/");
            // this.props.changeAlert({
            //   type: 'success',
            //   message: 'Sent! '+result.transactionHash,
            // });

            let receiptObj = {to:toAddress,from:result.from,amount,message:this.state.message,result:result}

            if(this.state.params){
              receiptObj.params = this.state.params
            }

            //  console.log("CHECKING SCANNER STATE FOR ORDER ID",this.props.scannerState)
            if(this.props.scannerState&&this.props.scannerState.daiposOrderId){
              receiptObj.daiposOrderId = this.props.scannerState.daiposOrderId
            }

            //console.log("SETTING RECEPITE STATE",receiptObj)
            this.props.setReceipt(receiptObj)
            this.props.changeView("receipt");
          } else {
            this.props.goBack();
            window.history.pushState({},"", "/");
            // NOTE: We don't i18nParseFloat here as we already expect it to be
            // a float when it's set as state and converted by the convertCurrency
            // method
            let receiptObj = {to:toAddress,from:err.request.account,amount,message:err.error.message,result:err}

            if(this.state.params){
              receiptObj.params = this.state.params
            }

            //  console.log("CHECKING SCANNER STATE FOR ORDER ID",this.props.scannerState)
            if(this.props.scannerState&&this.props.scannerState.daiposOrderId){
              receiptObj.daiposOrderId = this.props.scannerState.daiposOrderId
            }

            //console.log("SETTING RECEPITE STATE",receiptObj)
            this.props.setReceipt(receiptObj)
            this.props.changeView("receipt");
          }
        })
      }
    }else{
      this.props.changeAlert({type: 'warning', message: i18n.t('send_to_address.error')})
    }
  };

  render() {
    let {
      canSend,
      toAddress
    } = this.state;

    /*let sendMessage = ""
    if(this.state.message){
      sendMessage = (
        <div className="form-group w-100">
          <label htmlFor="amount_input">For</label>
          <div>
            {decodeURI(this.state.message)}
          </div>
        </div>
      )
    }*/

    let messageText = "Message"
    if(this.state.extraMessage){
      messageText = this.state.extraMessage
    }


    let amountInputDisplay = (
      <Input
        width={1}
        type="number"
        placeholder={0}
        step="any"
        value={this.state.amount}
        ref={(input) => { this.amountInput = input; }}
        onChange={event => this.updateState('amount', event.target.value)}
      />
    )
    if(this.props.scannerState&&this.props.scannerState.daiposOrderId){
      amountInputDisplay = (
        <Input
          width={1}
          type="number"
          step="any"
          readOnly
          placeholder={this.props.currencyDisplay(0)}
          value={this.state.amount}
          ref={(input) => { this.amountInput = input; }}
          onChange={event => this.updateState('amount', event.target.value)}
        />
      )
    }

    return (
      <div>
        <Box mb={4}>
          <Field mb={3} label={i18n.t('send_to_address.to_address')}>
            <Input
              width={1}
              type="text"
              placeholder="0x..."
              value={this.state.toAddress}
              ref={(input) => { this.addressInput = input; }}
              onChange={event => this.updateState('toAddress', event.target.value)}
            />
          </Field>

          <BorderButton icon={'CenterFocusWeak'} mb={4} width={1} onClick={() => {this.props.openScanner({view:"send_to_address"})}}>
            Scan QR Code
          </BorderButton>

          <div>{ this.state.toAddress && this.state.toAddress.length===42 &&
            <CopyToClipboard text={toAddress.toLowerCase()}>
              <div style={{cursor:"pointer"}} onClick={() => this.props.changeAlert({type: 'success', message: toAddress.toLowerCase()+' copied to clipboard'})}>
                <div style={{opacity:0.33}}>{this.state.fromEns}</div>
                <Blockies seed={toAddress.toLowerCase()} scale={10}/>
              </div>
            </CopyToClipboard>
          }</div>

          <Field mb={3} label={i18n.t("send_to_address.send_amount")}>
            {amountInputDisplay}
            {/* TODO: i18n this with merging PR #195 */}

            {/* We simply hide this one in case we will need it later
            this.state.currencyWarning ? (
              <InputInfo color="blue">
                {" "}
                {`You've been requested to send ${new Intl.NumberFormat(
                  getStoredValue("i18nextLng"),
                  {
                    style: "currency",
                    currency: this.state.currency,
                    maximumFractionDigits: 2
                  }
                ).format(this.state.requestedAmount)}.  We've converted this
                            amount according to our latest known exchange rate to
                              ${this.state.displayCurrency}.

                            `}
              </InputInfo>
            ) : null}
            */}
          </Field>
          {/* For Planet A and since messages currently don't work, we simply
              set them to display: "none".
            */}
          <Field display="none" mb={3} label={messageText}>
            <Input
              width={1}
              type="text"
              placeholder="optional unencrypted message"
              value={this.state.message}
              ref={(input) => { this.messageInput = input; }}
              onChange={event => this.updateState('message', event.target.value)}
            />
          </Field>
        </Box>
        <PrimaryButton size={'large'} width={1} disabled={!canSend} onClick={this.send}>
          Send
        </PrimaryButton>
      </div>
    )
  }
}
