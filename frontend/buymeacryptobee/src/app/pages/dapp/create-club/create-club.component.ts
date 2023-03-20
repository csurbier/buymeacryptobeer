import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthenticationService } from 'src/app/services/authentication.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ContractServiceService } from 'src/app/services/contract-service.service';
import { Web3ContractService } from 'src/app/services/web3-contract.service';
import { environment } from 'src/environments/environment';
import { Web3Storage } from 'web3.storage';
import { debounceTime } from 'rxjs';
@Component({
  selector: 'app-create-club',
  templateUrl: './create-club.component.html',
  styleUrls: ['./create-club.component.css']
})
export class CreateClubComponent implements OnInit {

  messageLoader: string = ""
  createForm: any;
  submitted = false
  imageLogoSrc: any
  free = true;
  hasWallet = false
  walletConnected = false
  walletAddress = ""
  customer = false
  logoHash :any 
  accountUrl =""
  choosenName="<name>"
  constructor(public contractService: ContractServiceService,
    public web3Contract: Web3ContractService,
    private formBuilder: FormBuilder,
   
    public authenticatedService: AuthenticationService,
   
    public ngZone: NgZone,
    public router:Router,
    private cd: ChangeDetectorRef,
    
    public ngxService: NgxUiLoaderService) {

    
      this.hasWallet = this.web3Contract.hasWallet;
      this.walletAddress = this.web3Contract.connectedAddress
      this.accountUrl = "https://www.buymeacryptobeer.com/"+this.choosenName
      this.logoHash=""
      console.log("===Create account constructor ",this.web3Contract.connectedAddress,this.accountUrl)
      this.createForm = this.formBuilder.group({
        "logo": [null, Validators.required],
        "fileSource": [null, Validators.compose([Validators.required])],
        "useWallet":[false],
        "name": ["", Validators.compose([Validators.required, Validators.maxLength(155)])],
        "website": ["", Validators.compose([Validators.maxLength(255)])],
        "description": ["", Validators.compose([Validators.required, Validators.maxLength(1024)])]
      });

      this.createForm.get("name").valueChanges.pipe(debounceTime(500)).subscribe(async (x: any) => {
        // encode parameter for url
        let nameEncoded = encodeURIComponent(x);
        this.ngxService.start()
        this.free = await this.contractService.isNameFree(nameEncoded,this.walletAddress)
        if (this.free){
          this.accountUrl = "https://www.buymeacryptobeer.com/"+nameEncoded
        }
        console.log("name free ", this.free)
        this.ngxService.stop()
      })
      this.createForm.get("useWallet").valueChanges.pipe(debounceTime(500)).subscribe(async (x: any) => {
        if (x){
          this.createForm.patchValue({
            "name":this.walletAddress
          })
        }
       
      })
  }
  ngOnInit(): void {
    this.web3Contract.needToRefreshData.subscribe((value)=>{
      if (value){
        //Need to refresh wallet info 
        console.log("=On reconnect wallet")
        this.ngZone.run(()=>{
          this.router.navigateByUrl("/")
        })
       }
    })
  }
  
  onLogoChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      
      this.createForm.patchValue({
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
        let file = this.createForm.get("fileSource").value
        console.log("Nom fichier ",file.name);
       
        // Construct with token and endpoint
        let  client = new Web3Storage({ token: environment.WEB_STORAGE_TOKEN });

        let rootCid = await client.put([file],{
          name: file.name,
          maxRetries: 3,
        });
        
        let ImgHash = `https://${rootCid}.ipfs.w3s.link/${file.name}`;
        resolve(ImgHash);
      } catch (error) {
        console.log("Error sending File to IPFS: ")
        console.log(error)
        resolve(null);
      }
    })
  }
  
  async onSubmit() {
    if (!this.submitted) {
      this.submitted = true;

      let name = this.createForm.get("name").value
      let description = this.createForm.get("description").value
      let website = this.createForm.get("website").value
      this.messageLoader = "Waiting blockchain transaction confirmation"
      
      this.ngxService.start()
      try {
        let nameEncoded = encodeURIComponent(name);
        let tx = await this.contractService.createAccount(this.walletAddress,nameEncoded,website,description,this.logoHash)

        this.submitted=false;
        this.ngxService.stop();
        Swal.fire({
          title: 'Thanks!',
          text: "Your donation url has been created!",
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(()=>{
          // go to account donation page 
          this.contractService.getAccount(this.walletAddress,this.walletAddress).then((account)=>{
            this.web3Contract.connectedAccount = account 
           
            this.ngZone.run(()=>{
              this.router.navigateByUrl("/my-account")
            })
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
