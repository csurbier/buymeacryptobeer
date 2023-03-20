import { Injectable, NgZone } from '@angular/core';
import { CanActivate, CanLoad, Router } from '@angular/router';
import { Web3ContractService } from '../services/web3-contract.service';
@Injectable({
  providedIn: 'root'
})
export class AccountConnectedGuard implements CanActivate {
  constructor(public web3Service: Web3ContractService, public router: Router,public ngZone:NgZone) {}
  canActivate(): boolean {
    console.log("Can activate ?",this.web3Service.walletConnected)
    if (!this.web3Service.walletConnected) {
        this.ngZone.run(()=>{
            this.router.navigateByUrl('/');
        })
     
      return false;
    }
    return true;
  }
}