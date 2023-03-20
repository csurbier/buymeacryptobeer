import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxUiLoaderModule } from "ngx-ui-loader";
import { DappheaderComponent } from './components/dappheader/dappheader.component';
import { DappfooterComponent } from './components/dappfooter/dappfooter.component';
import { HttpClientModule } from '@angular/common/http';
import { AccessDeniedComponent } from './pages/dapp/access-denied/access-denied.component';
import { CreateClubComponent } from './pages/dapp/create-club/create-club.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { FaqHomeComponent } from './pages/faq-home/faq-home.component';
import { ShowDashboardComponent } from './pages/show-dashboard/show-dashboard.component';
import { DonationPageComponent } from './pages/donation-page/donation-page.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';

@NgModule({
  declarations: [
    AppComponent,
    DappheaderComponent,
    DappfooterComponent,
    AccessDeniedComponent,
    CreateClubComponent,
    FaqHomeComponent,
    HomePageComponent,
    ShowDashboardComponent,
    DonationPageComponent,
    PrivacyComponent,
    TermsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    EditorModule,
    NgSelectModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxUiLoaderModule,
 
  ],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
    {provide: LocationStrategy, useClass: PathLocationStrategy},
  ],
  bootstrap: [AppComponent],
  exports: [
  ]
})
export class AppModule { }
