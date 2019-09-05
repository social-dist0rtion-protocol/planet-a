import React, { Component } from "react";
import { Tx, Input, Output, Util } from "leap-core";
import { Dapparatus } from "dapparatus";
import { equal, bi } from "jsbi-utils";
import Web3 from "web3";
import { Route } from 'react-router-dom';
import i18n from "./i18n";
import "./App.scss";

import burnerlogo from "./assets/burnerwallet.png";

import incogDetect from "./services/incogDetect.js";

import getConfig from "./config";
//https://github.com/lesnitsky/react-native-webview-messaging/blob/v1/examples/react-native/web/index.js
import RNMessageChannel from "react-native-webview-messaging";

import base64url from "base64url";
import EthCrypto from "eth-crypto";
import {
  getStoredValue,
  storeValues,
  eraseStoredValue
} from "./services/localStorage";

// VOLT RELATED IMPORTS
import { voltConfig as VOLT_CONFIG } from "./volt/config";
import { MainContainer } from "./volt/components/Common";
import { Header } from "./volt/components/Header";
import Menu from "./volt/components/Menu";
import { fetchBalanceCard } from "./volt/utils";

import MainPage from "./MainPage";
import ProposalPage from "./ProposalPage";
import Advanced from "./components/Advanced";
import AlertBox from './volt/components/AlertBox';

let LOADERIMAGE = burnerlogo;
let HARDCODEVIEW; // = "loader"// = "receipt"

const CONFIG = getConfig();

let title = i18n.t("app_name");

// TODO: Make this part of config.js. Tim didn't do it yet because he doesn't
// understand what these constants do :/
const BLOCKS_TO_PARSE_PER_BLOCKTIME = 32;
const MAX_BLOCK_TO_LOOK_BACK = 512; //don't look back more than 512 blocks

let interval;


let mainStyle = {
  width:"100%",
  backgroundColor: "linear-gradient(135deg, red, blue)",
  height:"100%",
  hotColor:"white",
  mainColorAlt:"white",
  mainColor:"white",
}

let buttonStyle = {
  primary: {
    backgroundImage:"linear-gradient("+mainStyle.mainColorAlt+","+mainStyle.mainColor+")",
    backgroundColor:mainStyle.mainColor,
    color:"#FFFFFF",
    whiteSpace:"nowrap",
    cursor:"pointer",
  },
  secondary: {
    border:"2px solid "+mainStyle.mainColor,
    color:mainStyle.mainColor,
    whiteSpace:"nowrap",
    cursor:"pointer",
  }
}

export default class App extends Component {
  constructor(props) {
    console.log(
      "[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[" +
        title +
        "]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]"
    );
    let view = "main";
    let cachedView = getStoredValue("view");
    let cachedViewSetAge = Date.now() - getStoredValue("viewSetTime");
    if (HARDCODEVIEW) {
      view = HARDCODEVIEW;
    } else if (cachedViewSetAge < 300000 && cachedView && cachedView !== 0) {
      view = cachedView;
    }
    console.log("CACHED VIEW", view);
    super(props);

    this.state = {
      web3: false,
      account: false,
      gwei: 1.1,
      view: view,
      sendLink: "",
      sendKey: "",
      alert: null,
      loadingTitle: "loading...",
      title: title,
      extraHeadroom: 0,
      balance: 0.0,
      vendors: {},
      ethprice: 0.0,
      hasUpdateOnce: false,
      possibleNewPrivateKey: "",
      isMenuOpen: false,
      filterQuery: "",
      favorites: {},
      sorting: 'votes',
      sortingOrder: 1,
    };
    this.alertTimeout = null;

    try {
      RNMessageChannel.on("json", update => {
        try {
          let safeUpdate = {};
          if (update.title) safeUpdate.title = update.title;
          if (update.extraHeadroom)
            safeUpdate.extraHeadroom = update.extraHeadroom;
          if (update.possibleNewPrivateKey)
            safeUpdate.possibleNewPrivateKey = update.possibleNewPrivateKey;
          this.setState(safeUpdate, () => {
            if (this.state.possibleNewPrivateKey) {
              this.dealWithPossibleNewPrivateKey();
            }
          });
        } catch (e) {
          console.log(e);
        }
      });
    } catch (e) {
      console.log(e);
    }

    this.poll = this.poll.bind(this);
    this.setPossibleNewPrivateKey = this.setPossibleNewPrivateKey.bind(this);
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.sort = this.sort.bind(this);
    this.filterList = this.filterList.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.toggleFavorites = this.toggleFavorites.bind(this);
  }

  parseAndCleanPath(path) {
    let parts = path.split(";");
    //console.log("PARTS",parts)
    let state = {};
    if (parts.length > 0) {
      state.toAddress = parts[0].replace("/", "");
    }
    if (parts.length >= 2) {
      state.amount = parts[1];
    }
    if (parts.length > 2) {
      state.message = decodeURI(parts[2])
        .replaceAll("%23", "#")
        .replaceAll("%3B", ";")
        .replaceAll("%3A", ":")
        .replaceAll("%2F", "/");
    }
    if (parts.length > 3) {
      state.extraMessage = decodeURI(parts[3])
        .replaceAll("%23", "#")
        .replaceAll("%3B", ";")
        .replaceAll("%3A", ":")
        .replaceAll("%2F", "/");
    }
    //console.log("STATE",state)
    return state;
  }
  openScanner(returnState) {
    this.setState({ returnState: returnState, scannerOpen: true });
  }
  returnToState(scannerState, nextView) {
    let updateState = Object.assign({ scannerState }, this.state.returnState);
    updateState.scannerOpen = false;
    updateState.returnState = false;
    console.log("UPDATE FROM RETURN STATE", updateState);
    if (nextView) {
      updateState.view = nextView;
    }
    this.setState(updateState);
  }
  updateDimensions() {
    //force it to rerender when the window is resized to make sure qr fits etc
    this.forceUpdate();
  }
  saveKey(update) {
    this.setState(update);
  }
  detectContext() {
    console.log("DETECTING CONTEXT....");
    //snagged from https://stackoverflow.com/questions/52759238/private-incognito-mode-detection-for-ios-12-safari
    incogDetect(result => {
      if (result) {
        console.log("INCOG");
        // document.getElementById("main").classList.add("main--incognito")
        // var contextElement = document.getElementById("context")
        // contextElement.innerHTML = 'INCOGNITO';
      } else if (typeof web3 !== "undefined") {
        console.log("NOT INCOG", this.state.metaAccount);
        if (window.web3.currentProvider.isMetaMask === true) {
          // document.getElementById("main").classList.add("main--metamask")
          // contextElement = document.getElementById("context")
          // contextElement.innerHTML = 'METAMASK';
        } else if (this.state.account && !this.state.metaAccount) {
          console.log("~~~*** WEB3", this.state.metaAccount, result);
          /*          document.getElementById("main").classList.add("main--web3")
          contextElement = document.getElementById("context")
          contextElement.innerHTML = 'WEB3';*/
        }
      }
    });
  }
  componentDidMount() {
    this.detectContext();

    this.loadProposals();

    console.log(
      "document.getElementsByClassName('className').style",
      document.getElementsByClassName(".btn").style
    );
    window.addEventListener("resize", this.updateDimensions.bind(this));
    if (window.location.pathname) {
      console.log(
        "PATH",
        window.location.pathname,
        window.location.pathname.length,
        window.location.hash
      );
      if (window.location.pathname.indexOf("/pk") >= 0) {
        let tempweb3 = new Web3();
        let base64encodedPK = window.location.hash.replace("#", "");
        let rawPK = tempweb3.utils.bytesToHex(
          base64url.toBuffer(base64encodedPK)
        );
        this.setState({ possibleNewPrivateKey: rawPK });
        window.history.pushState({}, "", "/");
      } else if (window.location.pathname.length === 43) {
        this.changeView("send_to_address");
        console.log("CHANGE VIEW");
      } else if (window.location.pathname.length === 134) {
        let parts = window.location.pathname.split(";");
        let claimId = parts[0].replace("/", "");
        let claimKey = parts[1];
        console.log("DO CLAIM", claimId, claimKey);
        this.setState({ claimId, claimKey });
        window.history.pushState({}, "", "/");
      } else if (
        (window.location.pathname.length >= 65 &&
          window.location.pathname.length <= 67 &&
          window.location.pathname.indexOf(";") < 0) ||
        (window.location.hash.length >= 65 &&
          window.location.hash.length <= 67 &&
          window.location.hash.indexOf(";") < 0)
      ) {
        console.log("incoming private key");
        let privateKey = window.location.pathname.replace("/", "");
        if (window.location.hash) {
          privateKey = window.location.hash;
        }
        privateKey = privateKey.replace("#", "");
        if (privateKey.indexOf("0x") !== 0) {
          privateKey = "0x" + privateKey;
        }
        //console.log("!!! possibleNewPrivateKey",privateKey)
        this.setState({ possibleNewPrivateKey: privateKey });
        window.history.pushState({}, "", "/");
      } else if (window.location.pathname.indexOf("/vendors;") === 0) {
        this.changeView("vendors");
      } else {
        let parts = window.location.pathname.split(";");
        console.log("PARTS", parts);
        if (parts.length >= 2) {
          let sendToAddress = parts[0].replace("/", "");
          let sendToAmount = parts[1];
          let extraData = "";
          if (parts.length >= 3) {
            extraData = parts[2];
          }
          if (
            (parseFloat(sendToAmount) > 0 || extraData) &&
            sendToAddress.length === 42
          ) {
            this.changeView("send_to_address");
          }
        }
      }
    }

    interval = setInterval(this.poll, 2000);
  }

  componentWillUnmount() {
    clearInterval(interval);
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  async poll() {
    const {
      account,
      xdaiweb3,
      voiceCreditsContract,
      voiceTokensContract
    } = this.state;
    if (account) {
      let creditsBalance = 0;
      let tokensBalance = 0;

      if (xdaiweb3) {
        const {
          utils: { fromWei }
        } = xdaiweb3;

        const voiceCreditsInWei = await voiceCreditsContract.methods
          .balanceOf(account)
          .call();
        creditsBalance = fromWei(voiceCreditsInWei, "ether");

        const voiceTokensInWei = await voiceTokensContract.methods
          .balanceOf(account)
          .call();
        tokensBalance = fromWei(voiceTokensInWei, "ether");
      }

      // TODO: Fetch Balance Card here

      // const plasma = this.state.xdaiweb3;
      // const passports = await fetchAllPassports(plasma, this.state.account);

      // Update balance card data
      const balanceCard = await fetchBalanceCard(
        this.state.xdaiweb3,
        this.state.account
      );
      this.setState({ balanceCard });

      this.setState({
        creditsBalance,
        tokensBalance,
        hasUpdateOnce: true
      });
    }
  }

  setPossibleNewPrivateKey(value) {
    this.setState({ possibleNewPrivateKey: value }, async () => {
      await this.dealWithPossibleNewPrivateKey();
    });
  }

  async dealWithPossibleNewPrivateKey() {
    //this happens as page load and you need to wait until
    if (this.state && this.state.hasUpdateOnce) {
      if (
        this.state.metaAccount &&
        this.state.metaAccount.privateKey.replace("0x", "") ===
          this.state.possibleNewPrivateKey.replace("0x", "")
      ) {
        this.setState({ possibleNewPrivateKey: false });
        this.changeAlert({
          type: "warning",
          message: "Imported identical private key."
        });
      } else {
        console.log("Checking on pk import...");
        console.log("this.state.metaAccount", this.state.metaAccount);
        console.log("this.state.isVendor", this.state.isVendor);

        console.log(
          !this.state.metaAccount ||
            this.state.balance >= 0.05 ||
            this.state.xdaiBalance >= 0.05 ||
            this.state.ethBalance >= 0.0005 ||
            this.state.daiBalance >= 0.05 ||
            (this.state.isVendor && this.state.isVendor.isAllowed)
        );
        if (
          !this.state.metaAccount ||
          this.state.balance >= 0.05 ||
          this.state.xdaiBalance >= 0.05 ||
          this.state.ethBalance >= 0.0005 ||
          this.state.daiBalance >= 0.05 ||
          (this.state.isVendor && this.state.isVendor.isAllowed)
        ) {
          this.setState(
            {
              possibleNewPrivateKey: false,
              withdrawFromPrivateKey: this.state.possibleNewPrivateKey
            },
            () => {
              this.changeView("withdraw_from_private");
            }
          );
        } else {
          this.setState({
            possibleNewPrivateKey: false,
            newPrivateKey: this.state.possibleNewPrivateKey
          });
          storeValues(
            {
              loadedBlocksTop: "",
              recentTxs: "",
              transactionsByAddress: ""
            },
            this.state.account
          );
          this.setState({
            recentTxs: [],
            transactionsByAddress: {},
            fullRecentTxs: [],
            fullTransactionsByAddress: {}
          });
        }
      }
    } else {
      setTimeout(this.dealWithPossibleNewPrivateKey.bind(this), 500);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let { network, web3, account } = this.state;
    if (web3 && network !== prevState.network /*&& !this.checkNetwork()*/) {
      console.log(
        "WEB3 DETECTED BUT NOT RIGHT NETWORK",
        web3,
        network,
        prevState.network
      );
      //this.changeAlert({
      //  type: 'danger',
      //  message: 'Wrong Network. Please use Custom RPC endpoint: https://dai.poa.network or turn off MetaMask.'
      //}, false)
    }
    if (prevState.account !== account) {
      const currency = getStoredValue("currency");
      if (currency) {
        storeValues({ currency }, account);
        eraseStoredValue("currency");
      }
    }
  }
  checkNetwork() {
    let { network } = this.state;
    return network === "xDai" || network === "Unknown";
  }
  setReceipt = obj => {
    this.setState({ receipt: obj });
  };
  changeView = (view, cb) => {
    if (
      view === "exchange" ||
      view === "main" /*||view.indexOf("account_")===0*/
    ) {
      storeValues({
        viewSetTime: Date.now(),
        view //some pages should be sticky because of metamask reloads
      });
    }
    /*if (view.startsWith('send_with_link')||view.startsWith('send_to_address')) {
    console.log("This is a send...")
    console.log("BALANCE",this.state.balance)
    if (this.state.balance <= 0) {
    console.log("no funds...")
    this.changeAlert({
    type: 'danger',
    message: 'Insufficient funds',
  });
  return;
  }
  }
  */
    this.changeAlert(null);
    console.log("Setting state", view);
    this.setState({ view, scannerState: false }, cb);
  };
  changeAlert = (alert, hide = true) => {
    console.log('Alert!!');
    clearTimeout(this.alertTimeout);
    this.setState({ alert });
    if (alert && hide) {
      this.alertTimeout = setTimeout(() => {
        this.setState({ alert: null });
      }, 200000);
    }
  };
  goBack(view = "main") {
    console.log("GO BACK");
    this.changeView(view);
    this.setState({ scannerOpen: false });
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 60);
  }
  async parseBlocks(parseBlock, recentTxs, transactionsByAddress) {
    let web3;
    if (this.state.xdaiweb3) {
      web3 = this.state.xdaiweb3;
    } else {
      web3 = this.state.web3;
    }
    let block = await web3.eth.getBlock(parseBlock);
    let updatedTxs = false;
    if (block) {
      let transactions = block.transactions;

      //console.log("transactions",transactions)
      for (let t in transactions) {
        //console.log("TX",transactions[t])
        let tx = await web3.eth.getTransaction(transactions[t]);
        // NOTE: NST information is encoded in a transaction's values. Hence if
        // we don't filter out NST transactions, they'll show up as huge
        // transfers in the UI.
        if (tx && tx.to && tx.from && !Util.isNST(tx.color)) {
          //console.log("EEETRTTTTERTETETET",tx)
          let smallerTx = {
            hash: tx.hash,
            to: tx.to.toLowerCase(),
            from: tx.from.toLowerCase(),
            value: web3.utils.fromWei("" + tx.value, "ether"),
            blockNumber: tx.blockNumber
          };

          if (
            smallerTx.from === this.state.account ||
            smallerTx.to === this.state.account
          ) {
            if (tx.input && tx.input !== "0x") {
              let decrypted = await this.decryptInput(tx.input);

              if (decrypted) {
                smallerTx.data = decrypted;
                smallerTx.encrypted = true;
              }

              try {
                smallerTx.data = web3.utils.hexToUtf8(tx.input);
              } catch (e) {}
              //console.log("smallerTx at this point",smallerTx)
              if (!smallerTx.data) {
                smallerTx.data = " *** unable to decrypt data *** ";
              }
            }
            updatedTxs =
              this.addTxIfAccountMatches(
                recentTxs,
                transactionsByAddress,
                smallerTx
              ) || updatedTxs;
          }
        }
      }
    }
    return updatedTxs;
  }
  async decryptInput(input) {
    let key = input.substring(0, 32);
    //console.log("looking in memory for key",key)
    let cachedEncrypted = this.state[key];
    if (!cachedEncrypted) {
      //console.log("nothing found in memory, checking local storage")
      cachedEncrypted = getStoredValue(key);
    }
    if (cachedEncrypted) {
      return cachedEncrypted;
    } else {
      if (this.state.metaAccount) {
        try {
          let parsedData = EthCrypto.cipher.parse(input.substring(2));
          const endMessage = await EthCrypto.decryptWithPrivateKey(
            this.state.metaAccount.privateKey, // privateKey
            parsedData // encrypted-data
          );
          return endMessage;
        } catch (e) {}
      } else {
        //no meta account? maybe try to setup signing keys?
        //maybe have a contract that tries do decrypt? \
      }
    }
    return false;
  }
  initRecentTxs() {
    let recentTxs = [];
    if (this.state.recentTx) recentTxs = recentTxs.concat(this.state.recentTxs);
    let transactionsByAddress = Object.assign(
      {},
      this.state.transactionsByAddress
    );
    if (!recentTxs || recentTxs.length <= 0) {
      recentTxs = getStoredValue("recentTxs", this.state.account);
      try {
        recentTxs = JSON.parse(recentTxs);
      } catch (e) {
        recentTxs = [];
      }
    }
    if (!recentTxs) {
      recentTxs = [];
    }
    if (Object.keys(transactionsByAddress).length === 0) {
      transactionsByAddress = getStoredValue(
        "transactionsByAddress",
        this.state.account
      );
      try {
        transactionsByAddress = JSON.parse(transactionsByAddress);
      } catch (e) {
        transactionsByAddress = {};
      }
    }
    if (!transactionsByAddress) {
      transactionsByAddress = {};
    }
    return [recentTxs, transactionsByAddress];
  }
  addTxIfAccountMatches(recentTxs, transactionsByAddress, smallerTx) {
    let updatedTxs = false;

    let otherAccount = smallerTx.to;
    if (smallerTx.to === this.state.account) {
      otherAccount = smallerTx.from;
    }
    if (!transactionsByAddress[otherAccount]) {
      transactionsByAddress[otherAccount] = [];
    }

    let found = false;
    if (parseFloat(smallerTx.value) > 0.005) {
      for (let r in recentTxs) {
        if (
          recentTxs[r].hash ===
          smallerTx.hash /* && (!smallerTx.data || recentTxs[r].data === smallerTx.data)*/
        ) {
          found = true;
          if (!smallerTx.data || recentTxs[r].data === smallerTx.data) {
            // do nothing, it exists
          } else {
            recentTxs[r].data = smallerTx.data;
            updatedTxs = true;
          }
        }
      }
      if (!found) {
        updatedTxs = true;
        recentTxs.push(smallerTx);
        //console.log("recentTxs after push",recentTxs)
      }
    }

    found = false;
    for (let t in transactionsByAddress[otherAccount]) {
      if (
        transactionsByAddress[otherAccount][t].hash ===
        smallerTx.hash /* && (!smallerTx.data || recentTxs[r].data === smallerTx.data)*/
      ) {
        found = true;
        if (
          !smallerTx.data ||
          transactionsByAddress[otherAccount][t].data === smallerTx.data
        ) {
          // do nothing, it exists
        } else {
          transactionsByAddress[otherAccount][t].data = smallerTx.data;
          if (smallerTx.encrypted)
            transactionsByAddress[otherAccount][t].encrypted = true;
          updatedTxs = true;
        }
      }
    }
    if (!found) {
      updatedTxs = true;
      transactionsByAddress[otherAccount].push(smallerTx);
    }

    return updatedTxs;
  }
  sortAndSaveTransactions(recentTxs, transactionsByAddress) {
    recentTxs.sort(sortByBlockNumber);

    for (let t in transactionsByAddress) {
      transactionsByAddress[t].sort(sortByBlockNumberDESC);
    }
    recentTxs = recentTxs.slice(0, 12);
    storeValues(
      {
        recentTxs: JSON.stringify(recentTxs),
        transactionsByAddress: JSON.stringify(transactionsByAddress)
      },
      this.state.account
    );
    this.setState({
      recentTxs: recentTxs,
      transactionsByAddress: transactionsByAddress
    });
  }
  async addAllTransactionsFromList(recentTxs, transactionsByAddress, theList) {
    let updatedTxs = false;

    for (let e in theList) {
      let thisEvent = theList[e];
      let cleanEvent = Object.assign({}, thisEvent);
      cleanEvent.to = cleanEvent.to.toLowerCase();
      cleanEvent.from = cleanEvent.from.toLowerCase();
      cleanEvent.value = this.state.web3.utils.fromWei(
        "" + cleanEvent.value,
        "ether"
      );
      if (cleanEvent.data) {
        let decrypted = await this.decryptInput(cleanEvent.data);
        if (decrypted) {
          cleanEvent.data = decrypted;
          cleanEvent.encrypted = true;
        } else {
          try {
            cleanEvent.data = this.state.web3.utils.hexToUtf8(cleanEvent.data);
          } catch (e) {}
        }
      }
      updatedTxs =
        this.addTxIfAccountMatches(
          recentTxs,
          transactionsByAddress,
          cleanEvent
        ) || updatedTxs;
    }
    return updatedTxs;
  }
  syncFullTransactions() {
    let initResult = this.initRecentTxs();
    let recentTxs = [];
    recentTxs = recentTxs.concat(initResult[0]);
    let transactionsByAddress = Object.assign({}, initResult[1]);

    let updatedTxs = false;
    updatedTxs =
      this.addAllTransactionsFromList(
        recentTxs,
        transactionsByAddress,
        this.state.transferTo
      ) || updatedTxs;
    updatedTxs =
      this.addAllTransactionsFromList(
        recentTxs,
        transactionsByAddress,
        this.state.transferFrom
      ) || updatedTxs;
    updatedTxs =
      this.addAllTransactionsFromList(
        recentTxs,
        transactionsByAddress,
        this.state.transferToWithData
      ) || updatedTxs;
    updatedTxs =
      this.addAllTransactionsFromList(
        recentTxs,
        transactionsByAddress,
        this.state.transferFromWithData
      ) || updatedTxs;

    if (
      updatedTxs ||
      !this.state.fullRecentTxs ||
      !this.state.fullTransactionsByAddress
    ) {
      recentTxs.sort(sortByBlockNumber);
      for (let t in transactionsByAddress) {
        transactionsByAddress[t].sort(sortByBlockNumberDESC);
      }
      recentTxs = recentTxs.slice(0, 12);
      //console.log("FULLRECENT",recentTxs)
      this.setState({
        fullRecentTxs: recentTxs,
        fullTransactionsByAddress: transactionsByAddress
      });
    }
  }

  // VOLT Methods
  openMenu() {
    this.setState({ isMenuOpen: true });
  }
  closeMenu() {
    this.setState({ isMenuOpen: false });
  }
  async loadProposals() {
    const endpoint = "https://www.npoint.io/documents/fe2e229f1864c7baae55";
    const response = await fetch(endpoint);
    const body = await response.json();
    const {
      proposals: proposalsList,
      voteEndTime,
      voteStartTime,
      trashAddress
    } = body.contents;

    // ToDo: remove second filter when store won't have any duplicate proposalId
    const proposals = proposalsList
      .map((p,i)=>({...p, id: i }))
      .filter(p => p.proposalId)
      .filter((p, i, list) => list.findIndex(p2 => p2.proposalId === p.proposalId) === i);

    this.setState(state => ({
      proposalsList: proposals,
      filterQuery: "",
      voteStartTime,
      voteEndTime,
      trashBox: trashAddress
    }));
  }

  sort(param) {
    return () => {
      this.setState(({ sorting, sortingOrder }) => ({
        sorting: param,
        sortingOrder: sorting === param ? sortingOrder * -1 : 1
      }));
    }
  }

  filterList(event) {
    const query = event.target.value;

    this.setState({
      filterQuery: query,
    });
  }

  resetFilter() {
    this.setState({
      filterQuery: "",
    });
  }

  toggleFavorites(id) {
    const { account, favorites } = this.state;
    const value = !!favorites[id];
    favorites[id] = !value;

    storeValues({ favorites: JSON.stringify(favorites) }, account);

    this.setState({ favorites });
  }

  render() {
    const { creditsBalance, alert } = this.state;
    const { xdaiweb3, web3, account, metaAccount } = this.state;
    const {
      isMenuOpen,
      proposalsList,
      filterQuery,
      favorites
    } = this.state;

    const { voteStartTime, voteEndTime, trashBox } = this.state;
    const web3Props = { plasma: xdaiweb3, web3, account, metaAccount };
    return (
      <>
          {account ? (
            <MainContainer>
              {isMenuOpen && <Menu onClose={this.closeMenu} account={account} />}
              <Header credits={creditsBalance} openMenu={this.openMenu} />

                <Route path="/" exact render={() => (
                  <MainPage
                    proposalsList={proposalsList}
                    filterList={this.filterList}
                    resetFilter={this.resetFilter}
                    sort={this.sort}
                    sorting={this.state.sorting}
                    sortingOrder={this.state.sortingOrder}
                    toggleFavorites={this.toggleFavorites}
                    filterQuery={filterQuery}
                    favorites={favorites}
                    voteStartTime={voteStartTime}
                    voteEndTime={voteEndTime}
                  />
                )} />

                <Route path="/settings" exact render={()=>(
                  <Advanced
                    isVendor={this.state.isVendor && this.state.isVendor.isAllowed}
                    buttonStyle={buttonStyle}
                    address={account}
                    balance={creditsBalance}
                    changeView={this.changeView}
                    privateKey={metaAccount.privateKey}
                    changeAlert={this.changeAlert}
                    currencyDisplay={this.currencyDisplay}
                    tokenSendV2={tokenSendV2.bind(this)}
                    metaAccount={this.state.metaAccount}
                    setPossibleNewPrivateKey={this.setPossibleNewPrivateKey}
                  />
                )} />

                <Route path="/proposal/:proposalId" render={({
                  match: { params: { proposalId } },
                  history
                }) => {
                  const proposal = (proposalsList || []).find(p => p.proposalId === proposalId);
                  if (!proposal) {
                    return 'Proposal not found';
                  } else {
                    return (
                      <ProposalPage
                        web3Props={web3Props}
                        favorite={favorites[proposalId]}
                        toggleFavorites={this.toggleFavorites}
                        proposal={proposal}
                        trashBox={trashBox}
                        creditsBalance={creditsBalance}
                        goBack={() => history.replace('/')}
                        changeAlert={this.changeAlert}
                      />
                    )
                  }
                }} />
              { alert && <AlertBox alert={alert} changeAlert={this.changeAlert}/> }
            </MainContainer>
          ) : (
            <p>Loading...</p>
          )}
          <Dapparatus
            config={{
              DEBUG: false,
              hide: true,
              requiredNetwork: ["Unknown", "xDai"],
              metatxAccountGenerator: false
            }}
            //used to pass a private key into Dapparatus
            newPrivateKey={this.state.newPrivateKey}
            fallbackWeb3Provider={CONFIG.ROOTCHAIN.RPC}
            network="LeapTestnet"
            xdaiProvider={CONFIG.SIDECHAIN.RPC}
            onUpdate={async state => {
              //console.log("DAPPARATUS UPDATE",state)

              const { account, favorites } = state;

              console.log('ACCOUNT ADDRESS:', account);

              if (!favorites) {
                const storedList = getStoredValue("favorites", account);
                const favoritesList = storedList ? JSON.parse(storedList) : {};
                this.setState({
                  favorites: favoritesList
                });
              }

              if (state.xdaiweb3) {
                let voiceCreditsContract;
                let voiceTokensContract;
                const StableABI = require("./contracts/StableCoin.abi.js");
                try {
                  voiceCreditsContract = new state.xdaiweb3.eth.Contract(
                    StableABI,
                    VOLT_CONFIG.CONTRACT_VOICE_CREDITS
                  );
                  voiceTokensContract = new state.xdaiweb3.eth.Contract(
                    StableABI,
                    VOLT_CONFIG.CONTRACT_VOICE_TOKENS
                  );
                } catch (err) {
                  console.log("Error loading contracts");
                }
                this.setState({
                  voiceTokensContract,
                  voiceCreditsContract
                });
              }
              if (state.web3Provider) {
                state.web3 = new Web3(state.web3Provider);
                this.setState(state, () => {
                  //console.log("state set:",this.state)
                  if (this.state.possibleNewPrivateKey) {
                    this.dealWithPossibleNewPrivateKey();
                  }
                  if (!this.state.parsingTheChain) {
                    this.setState({ parsingTheChain: true }, async () => {
                      let upperBoundOfSearch = this.state.block;
                      //parse through recent transactions and store in local storage
                      let initResult = this.initRecentTxs();
                      let recentTxs = initResult[0];
                      let transactionsByAddress = initResult[1];
                      let loadedBlocksTop = this.state.loadedBlocksTop;
                      if (!loadedBlocksTop) {
                        loadedBlocksTop = getStoredValue(
                          "loadedBlocksTop",
                          this.state.account
                        );
                      }
                      //  Look back through previous blocks since this account
                      //  was last online... this could be bad. We might need a
                      //  central server keeping track of all these and delivering
                      //  a list of recent transactions
                      let updatedTxs = false;
                      if (
                        !loadedBlocksTop ||
                        loadedBlocksTop < this.state.block
                      ) {
                        if (!loadedBlocksTop)
                          loadedBlocksTop = Math.max(2, this.state.block - 5);
                        if (
                          this.state.block - loadedBlocksTop >
                          MAX_BLOCK_TO_LOOK_BACK
                        ) {
                          loadedBlocksTop =
                            this.state.block - MAX_BLOCK_TO_LOOK_BACK;
                        }
                        let paddedLoadedBlocks =
                          parseInt(loadedBlocksTop) +
                          BLOCKS_TO_PARSE_PER_BLOCKTIME;
                        //console.log("choosing the min of ",paddedLoadedBlocks,"and",this.state.block)
                        let parseBlock = Math.min(
                          paddedLoadedBlocks,
                          this.state.block
                        );
                        //console.log("MIN:",parseBlock)
                        upperBoundOfSearch = parseBlock;
                        console.log(
                          " +++++++======== Parsing recent blocks ~" +
                            this.state.block
                        );
                        //first, if we are still back parsing, we need to look at *this* block too
                        if (upperBoundOfSearch < this.state.block) {
                          for (
                            let b = this.state.block;
                            b > this.state.block - 6;
                            b--
                          ) {
                            updatedTxs =
                              (await this.parseBlocks(
                                b,
                                recentTxs,
                                transactionsByAddress
                              )) || updatedTxs;
                          }
                        }
                        console.log(
                          " +++++++======== Parsing from " +
                            loadedBlocksTop +
                            " to " +
                            upperBoundOfSearch +
                            "...."
                        );
                        while (loadedBlocksTop < parseBlock) {
                          //console.log(" ++ Parsing Block "+parseBlock+" for transactions...")
                          updatedTxs =
                            (await this.parseBlocks(
                              parseBlock,
                              recentTxs,
                              transactionsByAddress
                            )) || updatedTxs;
                          parseBlock--;
                        }
                      }
                      if (updatedTxs || !this.state.recentTxs) {
                        this.sortAndSaveTransactions(
                          recentTxs,
                          transactionsByAddress
                        );
                      }
                      storeValues(
                        { loadedBlocksTop: upperBoundOfSearch },
                        this.state.account
                      );
                      this.setState({
                        parsingTheChain: false,
                        loadedBlocksTop: upperBoundOfSearch
                      });
                    });
                  }
                });
              }
            }}
          />
      </>
    );
  }
}

//<iframe id="galleassFrame" style={{zIndex:99,position:"absolute",left:0,top:0,width:800,height:600}} src="https://galleass.io" />

// NOTE: This function is used heavily by legacy code. We've reimplemented it's
// body though.
async function tokenSend(to, value, gasLimit, txData, cb) {
  let { account, web3, xdaiweb3, metaAccount } = this.state;
  if (typeof gasLimit === "function") {
    cb = gasLimit;
  }

  if (typeof txData === "function") {
    cb = txData;
  }

  value = xdaiweb3.utils.toWei("" + value, "ether");
  const color = await xdaiweb3.getColor(CONFIG.SIDECHAIN.DAI_ADDRESS);
  try {
    const receipt = await tokenSendV2(
      account,
      to,
      value,
      color,
      xdaiweb3,
      web3,
      metaAccount && metaAccount.privateKey
    );

    cb(null, receipt);
  } catch (err) {
    cb({
      error: err,
      request: { account, to, value, color }
    });
    // NOTE: The callback cb of tokenSend is not used correctly in the expected
    // format cb(error, receipt) throughout the app. We hence cannot send
    // errors in the callback :( When no receipt is returned (e.g. null), the
    // burner wallet will react with not resolving the "sending" view. This is
    // not ideal and should be changed in the future. We opened an issue on the
    // upstream repo: https://github.com/austintgriffith/burner-wallet/issues/157
  }
}

async function tokenSendV2(from, to, value, color, xdaiweb3, web3, privateKey) {
  const unspent = await xdaiweb3.getUnspent(from, color);

  let transaction;
  if (Util.isNST(color)) {
    const {
      outpoint,
      output: { data }
    } = unspent.find(
      ({ output }) =>
        Number(output.color) === Number(color) &&
        equal(bi(output.value), bi(value))
    );
    const inputs = [new Input(outpoint)];
    const outputs = [new Output(value, to, color, data)];
    transaction = Tx.transfer(inputs, outputs);
  } else {
    transaction = Tx.transferFromUtxos(unspent, from, to, value, color);
  }

  const signedTx = privateKey
    ? await transaction.signAll(privateKey)
    : await transaction.signWeb3(web3);
  const rawTx = signedTx.hex();

  // NOTE: Leapdao's Plasma implementation currently doesn't return receipts.
  // We hence have to periodically query the leap node to check whether our
  // transaction has been included into the chain. We assume that if it hasn't
  // been included after 5000ms (50 rounds at a 100ms timeout), it failed.
  // Unfortunately, at this point we cannot provide an error message for why

  let receipt;
  let rounds = 50;

  while (rounds--) {
    // redundancy rules ✊
    try {
      // web3 hangs here on invalid txs, trying to get receipt?
      // await this.web3.eth.sendSignedTransaction(tx.hex());
      await new Promise((resolve, reject) => {
        xdaiweb3.currentProvider.send(
          {
            jsonrpc: "2.0",
            id: 42,
            method: "eth_sendRawTransaction",
            params: [rawTx]
          },
          (err, res) => {
            if (err) {
              return reject(err);
            }
            resolve(res);
          }
        );
      });
    } catch (err) {
      // ignore for now
      console.log(err);
      // NOTE: Leap's node currently doesn't implement the "newBlockHeaders"
      // JSON-RPC call. When a transaction is rejected by a node,
      // sendSignedTransaction hence throws an error. We simply ignore this
      // error here and use the polling tactic below. For more details see:
      // https://github.com/leapdao/leap-node/issues/255

      // const messageToIgnore = "Failed to subscribe to new newBlockHeaders to confirm the transaction receipts.";
      // NOTE: In the case where we want to ignore web3's error message, there's
      // "\r\n {}" included in the error message, which is why we cannot
      // compare with the equal operator, but have to use String.includes.
      // if (!err.message.includes(messageToIgnore)) {
      //  throw err;
      // }
    }

    let res = await xdaiweb3.eth.getTransaction(signedTx.hash());

    if (res && res.blockHash) {
      receipt = res;
      break;
    }

    // wait ~100ms
    await new Promise(resolve => setTimeout(() => resolve(), 100));
  }

  if (receipt) {
    return receipt;
  }

  throw new Error("Transaction wasn't included into a block.");
}

let sortByBlockNumberDESC = (a, b) => {
  if (b.blockNumber > a.blockNumber) {
    return -1;
  }
  if (b.blockNumber < a.blockNumber) {
    return 1;
  }
  return 0;
};
let sortByBlockNumber = (a, b) => {
  if (b.blockNumber < a.blockNumber) {
    return -1;
  }
  if (b.blockNumber > a.blockNumber) {
    return 1;
  }
  return 0;
};

// ToDo: do not mutate native prototypes
/* eslint-disable no-extend-native */
String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};
