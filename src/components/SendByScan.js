import React, { Component } from "react";
import QrReader from "react-qr-reader";
import FileReaderInput from 'react-file-reader-input';
import qrimage from '../assets/qrcode.png';
import RNMessageChannel from 'react-native-webview-messaging';
import i18n from "../i18n";
import Web3 from 'web3';
import { storeValues } from "../services/localStorage";

function base64ToBitmap(base64) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      context.drawImage(img, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      resolve({
        data: Buffer.from(imageData.data),
        width: canvas.width,
        height: canvas.height
      });
    };
    img.src = base64;
  });
}

let interval
class SendByScan extends Component {
  constructor(props){
    super(props)
    let defaultToLegacyMode = false
    if(!window.navigator||!window.navigator.mediaDevices){
      defaultToLegacyMode = true
    }
    this.state = {
      delay: 400,
      browser: "",
      legacyMode: defaultToLegacyMode,
      scanFail: false,
      isLoading: false,
      percent: 5,
    };
    this.handleScan = this.handleScan.bind(this)

    if(RNMessageChannel&&typeof RNMessageChannel.send == "function"){
      try{
        RNMessageChannel.send("qr")
      }catch(e){}
    }
  }
  stopRecording = () => this.setState({ delay: false });
  onImageLoad = data => {
    console.log("IMAGE LOAD",data)
    console.log(data)
  }
  handleScan = data => {
    console.log("DATA")
    console.log(data)

    if(data && data.startsWith("/planeta/handshake")) {
      this.stopRecording();
      this.props.returnToState({ receipt: data.replace("/planeta/handshake/", "") }, "planet_a_finalize_handshake");
      return;
    }

    if(data && data.startsWith("/planeta/cheat/handshake")) {
      this.stopRecording();
      storeValues({expertMode: "true"});
      this.props.returnToState({}, "advanced");
      return;
    }

    //detect and respect status deep links...
    if(data && data.indexOf("get.status.im")>=0){
      let paymentLocation = data.indexOf("payment/")
      let paymentParts = data.substring(paymentLocation)
      let paymentPartsArray = paymentParts.split("/")
      console.log("Status Deep Link paymentParts",paymentParts,paymentPartsArray)

      if(paymentPartsArray.length>=4){
        let toAddress = paymentPartsArray[1]
        let amount = paymentPartsArray[2]
        let orderId = paymentPartsArray[3]
        this.props.returnToState({toAddress,amount,daiposOrderId:orderId,message:"Ching Order: "+orderId})
      }
    }else{
      let dataAfterColon
      if(data){
        dataAfterColon = data
        let colonAt = dataAfterColon.lastIndexOf(":")
        if(colonAt>=0) dataAfterColon = dataAfterColon.substring(colonAt+1)
        if(!dataAfterColon){
          dataAfterColon = data
        }
        let slashAt = dataAfterColon.lastIndexOf("/")
        if(slashAt>=0) dataAfterColon = dataAfterColon.substring(slashAt+1)
        if(!dataAfterColon){
          dataAfterColon = data
        }
        console.log("SCAN",data)
        if(data.indexOf("/pk")>=0){
          //don't mess with it
        }else{
          dataAfterColon=dataAfterColon.replace("#","")//had to pull this to get PKs to load in right
        }

      }
      console.log("dataAfterColon:",dataAfterColon)
      if (dataAfterColon) {
        this.stopRecording();
        const dataSplit = dataAfterColon.split(";");

        if (dataSplit.length === 1 && Web3.utils.isAddress(dataSplit[0])) {
          console.log("RETURN STATE:",this.props.returnState)
          let returnState = this.props.parseAndCleanMyAss(dataAfterColon)
          this.props.returnToState(returnState, this.props.returnState.goBackView)
        // NOTE: We only need the address and the amount as absolutely necessary
        // parts of the QR code scan. `message` is optional.
        } else if(Web3.utils.isAddress(dataSplit[0]) && !isNaN(parseFloat(dataSplit[1], 10))) {
          const returnState = {
            toAddress: dataSplit[0],
            amount: parseFloat(dataSplit[1], 10)
          }
          if (dataSplit.length > 1) {
            returnState.message = decodeURI(dataSplit[2])
          }
          if (dataSplit.length > 2) {
            returnState.currency = dataSplit[3]
          }
          this.props.returnToState(returnState);
        } else {
            // NOTE: Everything that is not a valid Ethereum address, we insert
            // in the URL to see if the burner wallet can resolve it.
            setTimeout(() => {
                window.location = "/" +  dataAfterColon
            }, 100)
        }
      }
    }
  };
  chooseDeviceId = (a,b) => {
    console.log("chooseDeviceId ",a,b)
    console.log("choose",a,b)
  }
  handleError = error => {
    console.log("SCAN ERROR")
    console.error(error);
    this.setState({legacyMode:true})
    this.props.onError(error);
  };
  onClose = () => {
    console.log("SCAN CLOSE")
    this.stopRecording();
    this.props.goBack(this.props.returnState.goBackView);
  };
  componentDidMount(){
    interval = setInterval(this.loadMore.bind(this),750)
  }
  componentWillUnmount() {
    clearInterval(interval)
    this.stopRecording();
  }
  loadMore(){
    let newPercent = this.state.percent+3
    if(newPercent>100) newPercent=5
    this.setState({percent:newPercent})
  }
  legacyHandleChange(e, results){
    //this.props.changeView('reader')
    results.forEach(result => {
      const file = result[1];
      let reader = new FileReader();
      reader.onload = (e) => {
        this.setState({imageData:e.target.result})
        Promise.all([
          base64ToBitmap(e.target.result),
          import('qrcode-reader')
        ])
          .then(([bitmap, { default: QrCode }]) => {
            console.log(QrCode);
            let qr = new QrCode();
            qr.callback = (err, value) => {
              this.setState({ isLoading: false });
              if (err) {
                setTimeout(() => {
                  console.log('FAILED TO SCAN!!!');
                  this.setState({ scanFail: err.toString() });
                  setTimeout(() => {
                    this.setState({ imageData: false });
                  }, 1500);
                  setTimeout(() => {
                    this.setState({ scanFail: false });
                  }, 3500);
                }, 1500);
              } else if (value && value.result) {
                this.handleScan(value.result);
              }
            };
            qr.decode(bitmap);
          })
          .catch(err => {
            alert('ERR1');
            console.error('ERR1', err);
            this.setState({ scanFail: err.toString() });
          });
      };
      reader.readAsDataURL(file);
    })
  }
  render() {

    let displayedImage = ""
    if(this.state.imageData){
      displayedImage = (
        <img style={{position:"absolute",left:0,top:0,maxWidth:"100%",opacity:0.7}} src={this.state.imageData} alt="qr" />
      )
    }

    let loaderDisplay = ""
    if(this.state.isLoading){
      let shadowAmount = 100
      let shadowColor = this.props.mainStyle.mainColor
      loaderDisplay = (
          <div style={{textAlign:'center'}}>
            <div style={{width:"100%"}}>
              <img src ={this.props.loaderImage} style={{maxWidth:"25%"}} alt=""/>
            </div>
            <div style={{width:"80%",height:1,backgroundColor:"#444444",marginLeft:"10%"}}>
              <div style={{width:this.state.percent+"%",height:1,backgroundColor:this.props.mainStyle.mainColorAlt,boxShadow:"0 0 "+shadowAmount/40+"px "+shadowColor+", 0 0 "+shadowAmount/30+"px "+shadowColor+", 0 0 "+shadowAmount/20+"px "+shadowColor+", 0 0 "+shadowAmount/10+"px #ffffff, 0 0 "+shadowAmount/5+"px "+shadowColor+", 0 0 "+shadowAmount/3+"px "+shadowColor+", 0 0 "+shadowAmount/1+"px "+shadowColor+""}}>
              </div>
            </div>
          </div>
      )
    }

    let failMessage = ""
    if(this.state.scanFail){
      failMessage = (
        <div style={{position:'absolute',left:0,top:0,zIndex:99,fontSize:24,color:"#FF0000",backgroundColor:"#333333",opacity:0.9,width:"100%",height:"100%",fontWeight:'bold'}}>
          <div style={{textAlign:"center",paddingTop:"15%"}}>
            <div style={{marginBottom:20}}><i className="fas fa-ban"></i></div>
          </div>
          <div style={{textAlign:"center",paddingTop:"25%"}}>
            <div>{i18n.t('send_by_scan.try_again')}</div>

          </div>
          <div style={{textAlign:"center",padding:"10%",paddingTop:"15%",fontSize:16}}>
            <div>{this.state.scanFail}</div>
          </div>
        </div>
      )
    }

    let displayedReader = (
      <QrReader
        delay={this.state.delay}
        onError={this.handleError}
        onScan={this.handleScan}
        onImageLoad={this.onImageLoad}
        style={{ width: "100%" }}
      />
    )
    if(this.state.legacyMode){
      displayedReader = (
        <div onClick={()=>{
          console.log("LOADING...")
          this.setState({isLoading:true})
        }}>
        <FileReaderInput as="binary" id="my-file-input" onChange={this.legacyHandleChange.bind(this)}>
        <div style={{position: 'absolute',zIndex:11,top:0,left:0,width:"100%",height:"100%",color:"#FFFFFF",cursor:"pointer"}}>
          {loaderDisplay}
          <div style={{textAlign:"center",paddingTop:"15%"}}>
            <div style={{marginBottom:20}}><i className="fas fa-camera"></i></div>
            <img src={qrimage} style={{position:"absolute",left:"36%",top:"25%",padding:4,border:"1px solid #888888",opacity:0.25,maxWidth:"30%",maxHight:"30%"}} alt="qr" />
          </div>
          <div style={{textAlign:"center",paddingTop:"35%"}}>

            <div>{i18n.t('send_by_scan.capture')}</div>
              <div className="main-card card w-100" style={{backgroundColor:"#000000"}}>
                <div className="content ops row" style={{paddingLeft:"12%",paddingRight:"12%",paddingTop:10}}>
                    <button className="btn btn-large w-100" style={{backgroundColor:this.props.mainStyle.mainColor}}>
                        <i className="fas fa-camera"  /> {i18n.t('send_by_scan.take_photo')}
                    </button>
                </div>
              </div>
            </div>
            <div style={{textAlign:"center",paddingTop:"5%"}}>
              Lay QR flat and take a picture of it from a distance.
            </div>
        </div>

        </FileReaderInput>
        </div>
      )
    }


    return (
      <div style={{  position: "fixed",top:0,left:0,right:0,bottom:0,zIndex:5,margin:'0 auto !important',background:"#000000"}}>
        <div style={{ position: 'absolute',zIndex: 256,top:20,right:20,fontSize:80,paddingRight:20,color:"#FFFFFF",cursor:'pointer'}} onClick={this.onClose} >
          <i className="fa fa-times" aria-hidden="true"></i>
        </div>
        {displayedReader}
        <div style={{position: 'absolute',zIndex:11,bottom:20,fontSize:12,left:20,color:"#FFFFFF",opacity:0.333}}>
          {window.navigator.userAgent} - {JSON.stringify(window.navigator.mediaDevices)}
        </div>
        {displayedImage}
        {failMessage}
      </div>
    );
  }
}

export default SendByScan;
