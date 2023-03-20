import { Injectable } from '@angular/core';


 
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  // Init with null to filter out the first value in a guard!
  isAuthenticated = false
  
  constructor() {
  }
 
   
}