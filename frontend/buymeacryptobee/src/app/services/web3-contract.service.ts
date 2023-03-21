import { Injectable, NgZone  } from '@angular/core'
import { environment } from 'src/environments/environment';
declare const window: any; 
import Swal from 'sweetalert2';
import { env } from 'process';
import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class Web3ContractService  {
  connectedAddress : string = ""
  connectedAccount : any 
  walletConnected : boolean = false ;
  hasWallet = false 
  web3 : any 
  
  public needToRefreshData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public refreshHeader : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(private ngZone:NgZone) {
      // Connect to the MetaMask EIP-1193 object. This is a standard
      // protocol that allows Ethers access to make all read-only
      // requests through MetaMask.
      if (window.ethereum){
        
          this.hasWallet = true
      }
      else {
        this.hasWallet = false 
        Swal.fire({
          title: 'Error!',
          text: "You need to install a wallet extension such as Metasmask to use our website !",
          icon: 'error',
          confirmButtonText: 'OK'
        })
       }
    
  }
 
   
  public getAccount()  {
    // MetaMask requires requesting permission to connect users accounts
    return new Promise(async resolve => {
    let address = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (address.length>0){
          this.connectedAddress = address[0];
          this.walletConnected = true 
          // URL "https://polygon-mumbai.infura.io/v3/914415386b7447af8a025e3dd72af038",
            
         this.web3 = new Web3(Web3.givenProvider)
         console.log('address', address);
          this.checkCurrentChainId().then((ok)=>{
            if (ok){
              resolve(true)
            }
            else{
              resolve(false)
            }
          })
       
    }
    else{
      resolve(false)
    }
  })
}

public  checkCurrentChainId = async () => {
  return new Promise(async resolve => {
   
  let networkId = await this.web3.eth.net.getId()
  console.log("===CUrrent chain ",networkId)
  if (networkId!=environment.networkId){
    // Ask to change network
   
    if (environment.production){
      this.switchNetworkToMainNet()
    }
    else{
      this.switchNetworkToTestNet()
    }
    this.launchChangeDetection()
    resolve(false)
  }
  else{
    this.launchChangeDetection()
    resolve(true)
  }
  })
}

public switchNetworkToMainNet = async () => {
  try {
    await this.web3.currentProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x89" }],
    });
  } catch (error:any) {
    console.log(error)
    console.log("Code erreur ",error.code)
    if (error.code === 4902) {
      try {
        await this.web3.currentProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x89",
              chainName: "Mainnet",
              rpcUrls: ["https://polygon-rpc.com/"],
              nativeCurrency: {
                name: "Matic",
                symbol: "Matic",
                decimals: 18,
              },
              blockExplorerUrls: ["https://polygonscan.com"],
            },
          ],
        });
      } catch (error:any) {
        this.switchNetwork()
      }
    }

}
}

public switchNetworkToTestNet = async () => {
  
    try {
      await this.web3.currentProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13881" }],
      });
    } catch (error:any) {
      console.log(error)
      console.log("Code erreur ",error.code)
      if (error.code === 4902) {
        try {
          await this.web3.currentProvider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x13881",
                chainName: "Mumbai",
                rpcUrls: ["https://rpc-mumbai.matic.today"],
                nativeCurrency: {
                  name: "Matic",
                  symbol: "Matic",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com"],
              },
            ],
          });
        } catch (error:any) {
          this.switchNetwork()
        }
      }
  
  }
}
/*
public switchNetworkToTestNet = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: environment.networkId }],
      });
    } catch (error:any) {
      console.log(error)
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: environment.networkId,
                chainName: "Hardhat",
                rpcUrls: ["http://127.0.0.1:8545/"],
                nativeCurrency: {
                  name: "HardhatETH",
                  symbol: "HardhatETH",
                  decimals: 18,
                },
                blockExplorerUrls: ["http://127.0.0.1:8545/"],
              },
            ],
          });
        } catch (error:any) {
          this.switchNetwork()
        }
      }
  
  }
}
*/
public launchChangeDetection(){
  console.log("==Launch change detection ")
      // detect Metamask account change
    window.ethereum.on('accountsChanged', (accounts:any)=> {
     
      this.connectedAddress  = accounts[0] 
      console.log("===Account changed ",this.connectedAddress)
      this.needToRefreshData.next(true);
    });

    // detect Network account change
    window.ethereum.on('chainChanged', (networkId:any)=>{
      console.log('chainChanged',networkId);
      if (networkId!=environment.networkId){
        this.launchChangeDetection()
           this.needToRefreshData.next(true);
          this.switchNetwork()
       }
       else{
       
        this.needToRefreshData.next(true);
       }
    });
}

public switchNetwork(){
  this.ngZone.run(()=>{
    Swal.fire({
      title: 'Error!',
      text: "Please connect your metamask to "+environment.chainId+" network",
      icon: 'error',
      confirmButtonText: 'OK'
    })
  })
}


public checkNetwork = async () => {
  
  let networkId = await this.web3.eth.net.getId()
 this.launchChangeDetection()
 if (networkId!=environment.networkId){
    this.switchNetwork()
 }
};
 
public signWithMetamask = async (message:any) => {
var hex = ''
for(var i=0;i<message.length;i++) {
    hex += ''+message.charCodeAt(i).toString(16)
}
var hexMessage = "0x" + hex

return await window.ethereum.request({
  method: 'personal_sign',
  params: [
    hexMessage,
    this.connectedAddress,
  ],
})
}

async signIn(){
return new Promise(async resolve => {
      let nonce = ""
      let messageToSign ="Welcome. You must sign in this message to be authenticated. Authentication code is :"+nonce;
      try {
      let signature = await this.signWithMetamask(messageToSign)
      if (signature){
         console.log(signature)
        resolve(signature)
      }
      else{
        resolve(null)
      }
    } catch(e){
      resolve(null)
    }
  })    
}
 
}; 
