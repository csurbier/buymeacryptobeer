import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { debounceTime } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ContractServiceService } from 'src/app/services/contract-service.service';
import { Web3ContractService } from 'src/app/services/web3-contract.service';
import { environment } from 'src/environments/environment';
import { Web3Storage } from 'web3.storage';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import FileSaver, { saveAs } from 'file-saver';
@Component({
  selector: 'app-show-dashboard',
  templateUrl: './show-dashboard.component.html',
  styleUrls: ['./show-dashboard.component.css']
})
export class ShowDashboardComponent implements OnInit {

  messageLoader: string = ""
  updateForm: any;
  submitted = false
  imageLogoSrc: any
  free = true;
  hasWallet = false
  walletConnected = false
  walletAddress = ""
  customer = false
  logoHash :any 
  accountUrl =""
  donationReceived=0
  connectedAccount : any 
  qrCodeUrl:any
  constructor(public contractService: ContractServiceService,
    public web3Contract: Web3ContractService,
    private formBuilder: FormBuilder,
   
    public authenticatedService: AuthenticationService,
    public sanitizer:DomSanitizer,
    public ngZone: NgZone,
    public router:Router,
    private cd: ChangeDetectorRef,
    
    public ngxService: NgxUiLoaderService) {

    
      this.hasWallet = this.web3Contract.hasWallet;
      this.walletAddress = this.web3Contract.connectedAddress
      this.initData()
  }
  ngOnInit(): void {
    this.web3Contract.needToRefreshData.subscribe((value)=>{
      if (value){
        //reinit data 
        this.initData()
       }
    })
  }

  copyMessage(){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.accountUrl;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  downloadQrCode(){
    FileSaver.saveAs("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+this.accountUrl, "myqrcode.png");
  }
 
  initData(){
    this.connectedAccount = this.web3Contract.connectedAccount
    this.accountUrl = "https://www.buymeacryptobeer.com/"+this.connectedAccount.name
    this.qrCodeUrl= this.sanitizer.bypassSecurityTrustResourceUrl("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+this.accountUrl)
    this.logoHash=this.connectedAccount.logo;
    this.imageLogoSrc = this.sanitizer.bypassSecurityTrustUrl(this.connectedAccount.logo);
    let amount = this.connectedAccount.balance
    if (amount){
      this.donationReceived =  Number(this.web3Contract.web3.utils.fromWei(Number(amount).toString(),"ether"));
    }
    else{
      this.donationReceived = 0 
    }
    console.log("DOnation received ",this.donationReceived)
    let logoName = this.connectedAccount.logo.split('/').pop();
      
    this.updateForm = this.formBuilder.group({
      "logo": [''],
      "fileSource": [null],
      "name": [this.connectedAccount.name, Validators.compose([Validators.required, Validators.maxLength(155)])],
      "website": [this.connectedAccount.website, Validators.compose([Validators.maxLength(255)])],
      "description": [this.connectedAccount.description, Validators.compose([Validators.required, Validators.maxLength(1024)])]
    });

    this.updateForm.get("name").valueChanges.pipe(debounceTime(500)).subscribe(async (x: any) => {
      // encode parameter for url
      let nameEncoded = encodeURIComponent(x);
      this.free = await this.contractService.isNameFree(nameEncoded,this.walletAddress)
      if (this.free){
        this.accountUrl = "https://www.buymeacryptobeer.com/"+nameEncoded
      }
      console.log("name free ", this.free)
    })
  }
  onLogoChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      
      this.updateForm.patchValue({
        fileSource: file
      });
      this.sendFileToIpfs().then((valeur)=>{
        if (valeur){
          this.logoHash = valeur 
         
        }
       
      })
      // File Preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imageLogoSrc = reader.result as string;
      }
      reader.readAsDataURL(file)
      this.cd.markForCheck();
    }
    
  }

  async sendFileToIpfs() {
    return new Promise(async resolve => {
      try {
        let file = this.updateForm.get("fileSource").value
        console.log("Nom fichier ",file.name);
       
        // Construct with token and endpoint
        let  client = new Web3Storage({ token: environment.WEB_STORAGE_TOKEN });

        let rootCid = await client.put([file],{
          name: file.name,
          maxRetries: 3,
        });
        
        let ImgHash = `ipfs://${rootCid}/${file.name}`;
        resolve(ImgHash);
      } catch (error) {
        console.log("Error sending File to IPFS: ")
        console.log(error)
        resolve(null);
      }
    })
  }
  async withdraw(){
    if (!this.submitted){
      this.submitted = true;
      this.messageLoader = "Waiting blockchain transaction confirmation"
      
      this.ngxService.start()
      try {
        
        let tx = await this.contractService.withdraw(this.walletAddress)
        this.contractService.getAccount(this.walletAddress,this.walletAddress).then((account)=>{
          this.web3Contract.connectedAccount = account 
          this.connectedAccount = account;
          this.donationReceived = this.connectedAccount.balance
          this.cd.detectChanges()
          this.submitted=false;
          this.ngxService.stop();
          Swal.fire({
            title: 'Thanks!',
            text: "Your funds have been set to your wallet",
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(()=>{
            
          })
        })
      }
      catch (error:any) {
        console.log(error)
        this.submitted = false
        this.ngxService.stop();
        if (error.code!=4001){
          this.showError()
        }
       
      }
    }
  
  }
  async onSubmit() {
    if (!this.submitted) {
      this.submitted = true;

      let name = this.updateForm.get("name").value
      let description = this.updateForm.get("description").value
      let website = this.updateForm.get("website").value
      this.messageLoader = "Waiting blockchain transaction confirmation"
      
      this.ngxService.start()
      try {
        let nameEncoded = encodeURIComponent(name);
        console.log(nameEncoded)
        console.log(website)
        console.log(description)
        console.log(this.logoHash)
        let tx = await this.contractService.updateAccount(this.walletAddress,nameEncoded,website,description,this.logoHash)

        this.submitted=false;
        this.ngxService.stop();
        Swal.fire({
          title: 'Thanks!',
          text: "Your donation url has been updated!",
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(()=>{
          //TODO go to account donation page 
        })
      }
      catch (error:any) {
        console.log(error)
        this.submitted = false
        this.ngxService.stop();
        if (error.code!=4001){
          this.showError()
        }
       
      }
    }
  }

  showError(){
    Swal.fire({
      title: 'Sorry an error occured',
      text: "Please try later",
      icon: 'error',
      showCancelButton: false,
      confirmButtonText: 'OK',
    })
  }
}
