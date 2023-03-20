import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Web3ContractService } from 'src/app/services/web3-contract.service';
import * as dayjs from 'dayjs';
import { ContractServiceService } from 'src/app/services/contract-service.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-home',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
    messageLoader =""
   hasWallet = false 
   walletConnected=false 
   walletAddress = "" 
   
   customer = false 

  constructor(public web3Contract:Web3ContractService,
    public contract: ContractServiceService,
    public authentificationService : AuthenticationService,
    public ngZone:NgZone,
    public changeDetector:ChangeDetectorRef,
    public router:Router,

    public ngxService: NgxUiLoaderService) {
       
   }

  ngOnInit()  {
    if (!this.authentificationService.isAuthenticated){
      this.hasWallet = this.web3Contract.hasWallet;
      
      if (this.hasWallet){
        this.web3Contract.needToRefreshData.subscribe((value)=>{
          if (value){
            //Need to refresh wallet info 
            console.log("=On reconnect wallet")
            this.ngZone.run(()=>{
              this.connectWallet()
            })
          
          }
        })
      }
     
    } 
    else{
      this.hasWallet = this.web3Contract.hasWallet;
      this.customer = true
      this.walletConnected=true
    }
  }

  connectWallet(){
    console.log("==Connect wallet")
    this.web3Contract.getAccount().then((data:any)=>{
      console.log(data)
      if (data){
        this.walletAddress = this.web3Contract.connectedAddress
        this.walletConnected=true
        this.initAddress()
        this.contract.initContract().then((done)=>{
          if (done){
            this.checkIfAccount()
          }
         
        })
      }
    })
  }
  
  initAddress(){
    this.walletConnected = this.web3Contract.walletConnected
    
  }
  checkIfAccount(){
    this.contract.getAccount(this.walletAddress,this.walletAddress).then((account)=>{
      this.web3Contract.connectedAccount = account 
      let name = account.name 
      console.log(account)
      if (name==""){
        //Not a customer 
        
        this.customer = false 
        this.authentificationService.isAuthenticated=false
      }
      else{
        this.customer = true
        this.web3Contract.connectedAddress = this.walletAddress
        this.authentificationService.isAuthenticated=true
        this.web3Contract.refreshHeader.next(true)
      }
      this.ngZone.run(()=>{
        console.log("===customer ",this.customer)
        this.ngxService.stop()
        this.changeDetector.detectChanges()
      })
    
    })
  }

  goToAccount(){
    
    this.router.navigateByUrl("/my-account")
  }

}
