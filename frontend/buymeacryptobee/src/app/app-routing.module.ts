import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AccountConnectedGuard } from './guard/account-connected.guard';
import { AutoLoginGuard } from './guard/auto-login.guard';
import { AccessDeniedComponent } from './pages/dapp/access-denied/access-denied.component';
import { CreateClubComponent } from './pages/dapp/create-club/create-club.component';
import { DonationPageComponent } from './pages/donation-page/donation-page.component';
import { FaqHomeComponent } from './pages/faq-home/faq-home.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { ShowDashboardComponent } from './pages/show-dashboard/show-dashboard.component';
import { TermsComponent } from './pages/terms/terms.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'denied', component: AccessDeniedComponent },
  { path: 'create-account', 
     canActivate:[AccountConnectedGuard],
      component: CreateClubComponent,
  },
  { path: 'my-account', 
  canActivate:[AccountConnectedGuard],
   component: ShowDashboardComponent,
  },
  { path: 'home', 
  component: HomePageComponent,
},
{ path: 'faq', 
component: FaqHomeComponent,
},
{ path: 'terms', 
component: TermsComponent,
},
{ path: 'privacy', 
component: PrivacyComponent,
},
//Wild Card Route for 404 request
{ path: '**', pathMatch: 'full', component: DonationPageComponent },
//  { path: '', redirectTo: '/dapp', pathMatch: 'full' },
  
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule { }