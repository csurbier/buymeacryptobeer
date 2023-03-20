import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import ABI from './contract_abi.json';
import { Web3ContractService } from './web3-contract.service';

@Injectable({
  providedIn: 'root'
})
export class ContractServiceService {
  alreadyInit = false 
  contract : any ; 
  signedContrat : any ; 

  constructor(private web3ContractService:Web3ContractService) { }

  async initContract() {
    return new Promise(async resolve => {
      console.log("=== NFT INIT CONTRACT ===== ", this.alreadyInit)
      if (this.alreadyInit) {
        resolve(true)
      }
      
      this.alreadyInit = true
       
      try {
        this.contract = new this.web3ContractService.web3.eth.Contract(
          ABI,
          environment.contractAdress,
        );
        if (this.contract){
         
          this.alreadyInit = true;
        }
      
        resolve(true)
      }
      catch (error) {
        console.log(error)
        resolve(false)
      }
    })
  } 
 
  async getAccount(accountAddress:string,walletAddress:string){
    let results = await this.contract.methods.getAccount(accountAddress).call({ from: walletAddress }) ;
    return results;
  }
  async getDonations(walletAddress:string){
    let results = await this.contract.methods.getDonations(walletAddress).call({ from: walletAddress }) ;
    return results;
  }

  async walletAddressForName(_name:string,walletAddress:string){
    let results = await this.contract.methods.getWalletForName(_name).call({ from: walletAddress });
    return results;
  }

  async isNameFree(_name:string,walletAddress:string){
    let results = await this.contract.methods.isNameFree(_name).call({ from: walletAddress });
    return results;
  }

  async createAccount(walletAddress:string,_name:string,_website:string,_description:string,_logo:string){
    
    let results = await this.contract.methods.createAccount(_name,_website,_description,_logo).send({from: walletAddress});
    return results
  }
  async updateAccount(walletAddress:string,_name:string,_website:string,_description:string,_logo:string){
    
    let results = await this.contract.methods.updateAccount(_name,_website,_description,_logo).send({from: walletAddress});
    return results
  }

  async withdraw(walletAddress:string){
    let results = await this.contract.methods.withdraw().send({from: walletAddress});
    return results
  }
  async deposit(to:string,walletAddress:string,amount:number){
    let results = await this.contract.methods.deposit(to).send({value:amount,from: walletAddress});
    return results
  }
}
