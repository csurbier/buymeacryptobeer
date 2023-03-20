import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
@Injectable({
  providedIn: 'root'
})
export class AutoLoginGuard implements CanActivate {
  constructor(public auth: AuthenticationService, public router: Router) {}
  canActivate(): boolean {
    console.log("Can activate ?",this.auth.isAuthenticated)
    if (!this.auth.isAuthenticated) {
      this.router.navigateByUrl('/');
      return false;
    }
    return true;
  }
}