import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { debounceTime } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ContractServiceService } from 'src/app/services/contract-service.service';
import { Web3ContractService } from 'src/app/services/web3-contract.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-donation-page',
  templateUrl: './donation-page.component.html',
  styleUrls: ['./donation-page.component.css']
})
export class DonationPageComponent implements OnInit {

  messageLoader: string = ""
  
  hasWallet = false
  walletConnected = false
  walletAddress = ""
  customer = false
  
  connectedAccount : any 
  canShow = false 
  noAccountFound = false 
  accountUrl : any 
  imageLogoSrc : any 
  accountDonation:any ;
  amount=1 
  submitted = false 
  donatorPageName:any
  constructor(public contractService: ContractServiceService,
    public web3Contract: Web3ContractService,
    private formBuilder: FormBuilder,
   
    public authenticatedService: AuthenticationService,
    public sanitizer:DomSanitizer,
    public ngZone: NgZone,
    public router:Router,
    private cd: ChangeDetectorRef,
    
    public ngxService: NgxUiLoaderService) {

     this.donatorPageName =  window.location.href.split('/').pop();
   
      
  }
  ngOnInit() {
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
    else{

    }
  }

  sub(){
    if (this.amount<2){
      return
    }
    else{
      this.amount--
    }
  }
  add(){
     
      this.amount++
    
  }
  connectWallet(){
    this.web3Contract.getAccount().then((data:any)=>{
      
      if (data){
        this.walletAddress = this.web3Contract.connectedAddress
        this.walletConnected=true
        this.initAddress()
        this.contractService.initContract().then((done)=>{
          if (done){
            this.getAccountInformation()
          }
         
        })
      }
    })
  }
  
  initAddress(){
    this.walletConnected = this.web3Contract.walletConnected
    
  }

  getAccountInformation(){
    this.messageLoader = "Retrieving account information on blockchain"
   
    let accountName =  window.location.href.split('/').pop();
    
    if (accountName){
      this.ngxService.start()
      this.contractService.walletAddressForName(accountName,this.walletAddress).then((address)=>{
        console.log(address)
        if (address=="0x0000000000000000000000000000000000000000"){
          //No account
          this.canShow=false
          this.noAccountFound=true
          this.ngxService.stop()
        }
        else{
         
          this.noAccountFound=false 
          this.contractService.getAccount(address,this.walletAddress).then((account)=>{
            console.log("Account retourve ",account)
            this.ngxService.stop()
            this.accountDonation = account
            this.accountUrl = "https://www.buymeacryptobeer.com/"+account.name

          
            this.imageLogoSrc = this.sanitizer.bypassSecurityTrustUrl(account.logo);
            
            this.canShow=true
            this.cd.detectChanges()
          })
         
        }
        
        this.messageLoader=""
       
      })
    }
  }
 
  async deposit(){
    if (!this.submitted){
      this.submitted=true
      this.messageLoader = "Waiting blockchain transaction confirmation"
      
      this.ngxService.start()
      try {
        let don = Number(this.web3Contract.web3.utils.toWei(Number(this.amount).toString(),"ether"));
     
        let tx = await this.contractService.deposit(this.accountDonation.owner,this.walletAddress,don)

        this.submitted=false;
        this.ngxService.stop();
        Swal.fire({
          title: 'Thanks!',
          text: "Your donation has been sent to the creator !",
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(()=>{
          
        })
      }
      catch (error:any) {
        console.log(error)
        this.submitted = false
        this.ngxService.stop();
        if (error.code!=4001){
          this.showError(error.message)
        }
       
      }
    }
    
  }

  showError(message:any){
    
    Swal.fire({
      title: 'Sorry an error occured',
      text: message,
      icon: 'error',
      showCancelButton: false,
      confirmButtonText: 'OK',
    })
  }
}
