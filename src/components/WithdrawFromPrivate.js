import React from 'react';
import Web3 from 'web3';
import { Scaler } from "dapparatus";
import Blockies from 'react-blockies';
import i18n from '../i18n';
import {
  Box,
  Field,
  Flex,
  Input,
  Text,
} from 'rimble-ui'
import { PrimaryButton } from "./Buttons";
import i18nParseFloat from "../i18n/parseFloat";


// TODO: Can this be state of SendToAddress?
let pollInterval

export default class SendToAddress extends React.Component {

  constructor(props) {
    super(props);
    let initialState = {
      amount: "",//props.amount-0.01 ?
      privateKey: props.privateKey,
      canWithdraw: false,
    }

    let tempweb3 = new Web3();
    initialState.metaAccount = tempweb3.eth.accounts.privateKeyToAccount(props.privateKey);
    initialState.fromAddress = initialState.metaAccount.address.toLowerCase();

    this.state = initialState
    console.log("WithdrawFromPrivate constructor",this.state)
  }

  updateState = (key, value) => {
    this.setState({ [key]: value },()=>{
      this.setState({ canWithdraw: this.canWithdraw() })
    });
  };

  componentDidMount(){
    this.setState({ canWithdraw: this.canWithdraw() })
    pollInterval = setInterval(this.poll.bind(this),1500)
    setTimeout(this.poll.bind(this),250)
  }
  componentWillUnmount(){
    clearInterval(pollInterval)
  }

  async poll(){
    const { xdaiweb3, xdaiContract } = this.props;
    const { fromAddress } = this.state;
    let fromBalance = await xdaiContract.methods.balanceOf(fromAddress).call();

    fromBalance = parseFloat(xdaiweb3.utils.fromWei(fromBalance,'ether'))
    fromBalance = fromBalance.toFixed(2)
    console.log("from balance:",fromBalance,"of from address",fromAddress)

    if(typeof this.state.amount == "undefined"){
      this.setState({fromBalance,canWithdraw:this.canWithdraw(),amount:fromBalance})
    }else{
      this.setState({fromBalance,canWithdraw:this.canWithdraw()})
    }
  }

  canWithdraw() {
    return (i18nParseFloat(this.state.amount) > 0 && i18nParseFloat(this.state.amount) <= parseFloat(this.state.fromBalance))
  }

  withdraw = async () => {
    let { fromAddress, amount, metaAccount } = this.state
    const { tokenSendV2, address, web3, xdaiweb3, daiTokenAddr} = this.props

    if(this.state.canWithdraw){
        console.log("SWITCH TO LOADER VIEW...")
        this.props.changeView('loader_SIDECHAIN')
        setTimeout(()=>{window.scrollTo(0,0)},60)
        //console.log("metaAccount",this.state.metaAccount,"amount",this.props.web3.utils.toWei(amount,'ether'))

        // NOTE: Amount needs to be cast to a string here.
        const weiAmount = web3.utils.toWei(""+amount, "ether")
        const color = await xdaiweb3.getColor(daiTokenAddr);

        try {
          await tokenSendV2(
            fromAddress,
            address,
            weiAmount,
            color,
            xdaiweb3,
            web3,
            metaAccount.privateKey
          )
        } catch(err) {
          this.props.goBack();
          window.history.pushState({},"", "/");
          this.props.changeAlert({
            type: 'warning',
            message: 'Transaction was rejected by the node. Please try again or contract an administrator.'
          });
          return;
        }

        this.props.goBack();
        window.history.pushState({},"", "/");
        this.props.changeAlert({
          type: 'success',
          message: 'Withdrawn!'
        });
    }else{
      this.props.changeAlert({type: 'warning', message: i18n.t('withdraw_from_private.error')})
    }
  };

  render() {
    let { canWithdraw, fromAddress } = this.state;
    let { currencyDisplay } = this.props;

    let products = []
    for(let p in this.props.products){
      let prod = this.props.products[p]
      if(prod.exists){
        if(prod.isAvailable){
          let costInNativeCurrency = this.props.web3.utils.fromWei(prod.cost,'ether')
          products.push(
            <div key={p} className="content bridge row">
              <div className="col-12 p-1">
                <button className="btn btn-large w-100"
                  onClick={()=>{
                    console.log(prod.id,prod.name,prod.cost,prod.isAvailable)
                    let currentAmount = this.state.amount
                    if(currentAmount) currentAmount+=parseFloat(costInNativeCurrency)
                    else currentAmount = parseFloat(costInNativeCurrency)
                    if(currentAmount!==this.state.amount){
                      this.setState({amount:currentAmount})
                    }
                  }}
                  style={this.props.buttonStyle.secondary}>
                  <Scaler config={{startZoomAt:400,origin:"50% 50%"}}>
                    {this.props.web3.utils.hexToUtf8(prod.name)} {currencyDisplay(costInNativeCurrency)}
                  </Scaler>
                </button>
              </div>
            </div>
          )
        }

      }
    }
    if(products.length>0){
      products.push(
        <div key={"reset"} className="content bridge row">
          <div className="col-12 p-1">
            <button className="btn btn-large w-100"
              onClick={()=>{
                this.setState({amount:""})
              }}
              style={this.props.buttonStyle.secondary}>
              <Scaler config={{startZoomAt:400,origin:"50% 50%"}}>
                Reset
              </Scaler>
            </button>
          </div>
        </div>
      )
    }

    return (
      <div>
        <Box mb={4}>

          <Flex justifyContent="space-between" alignItems="center" mb={3}>
            <Blockies seed={fromAddress} scale={10} />
            <Text fontSize={5} fontWeight="bold">{currencyDisplay(this.state.fromBalance)}</Text>
          </Flex>

          <Field mb={3} label={i18n.t('withdraw_from_private.from_address')}>
            <Input
              width={1}
              type="text"
              placeholder="0x..."
              spellcheck="false"
              value={fromAddress}
            />
          </Field>

          <Field mb={3} label={i18n.t('withdraw_from_private.amount')}>
            <Input
              width={1}
              type="number"
              step="any"
              placeholder={currencyDisplay(0)}
              value={this.state.amount}
              onChange={event => this.updateState('amount', event.target.value)}
            />
          </Field>
          {products}
        </Box>
        <PrimaryButton
          size={'large'}
          width={1}
          disabled={!canWithdraw}
          onClick={this.withdraw}>
          {i18n.t('withdraw_from_private.withdraw')}
        </PrimaryButton>
      </div>
    )
  }
}
