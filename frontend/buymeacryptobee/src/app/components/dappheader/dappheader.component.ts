import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ContractServiceService } from 'src/app/services/contract-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dappheader',
  templateUrl: './dappheader.component.html',
  styleUrls: ['./dappheader.component.css']
})
export class DappheaderComponent implements OnInit {

  walletAddress:string|undefined;
  eventConnectedReceived = false;
 
  constructor(public contractService:ContractServiceService,
   
    public router:Router,
    private authService: AuthenticationService,
    public ngZone:NgZone) { 
   
  }

   
  ngOnInit(): void {
  }

  logoutMetamask(){

    Swal.fire({
      title: 'Are you sure you want to disconnect your Metamask ?',
      text: "This site will not be able to work properly",
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: "Annuler"
    }).then(async (value) => {
      if (value.dismiss) {

      }
      else {
       
        this.walletAddress=undefined;
        
      }

    })

  }
  

}
