// Let's update the app.component.ts file to remove the handleRedirectCallback method
// and use the correct approach for MSAL Angular 0.1.4

// File: src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { BroadcastService } from '@azure/msal-angular';
import { MsalError } from 'msal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Azure SSO Demo';
  isLoggedIn = false;
  
  constructor(
    private msalService: MsalService, 
    private broadcastService: BroadcastService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Check if user is logged in
    this.isLoggedIn = !!this.msalService.getUser();
    
    // Subscribe to login success event
    this.broadcastService.subscribe('msal:loginSuccess', (payload) => {
      console.log('Authentication successful');
      this.isLoggedIn = true;
    });
    
    // Subscribe to login failure event
    this.broadcastService.subscribe('msal:loginFailure', (error: MsalError) => {
      console.error('Authentication error:', error);
    });
  }
  
  login() {
    this.msalService.loginRedirect({
      scopes: ['user.read']
    });
  }
  
  logout() {
    this.msalService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
  
  // Clean up subscriptions when component is destroyed
  ngOnDestroy() {
    this.broadcastService.getMSALSubject().next(1);
    if (this.broadcastService.getLoginFailedSubject()) {
      this.broadcastService.getLoginFailedSubject().next(1);
    }
    if (this.broadcastService.getLoginSuccessSubject()) {
      this.broadcastService.getLoginSuccessSubject().next(1);
    }
  }
}

// Now let's update app.module.ts with the broadcast service and correct MSAL setup
// File: src/app/app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { MsalModule, MsalInterceptor, MSAL_CONFIG, MSAL_CONFIG_ANGULAR, MsalService, BroadcastService } from '@azure/msal-angular';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
];

// MSAL configuration aligned with 0.1.4 version expectations
export function MSALConfigFactory() {
  return {
    clientID: environment.clientId,
    authority: `https://login.microsoftonline.com/${environment.tenantId}`,
    validateAuthority: true,
    redirectUri: 'http://localhost:4200/',
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
    navigateToLoginRequestUrl: true,
    popUp: false,
    consentScopes: ['user.read'],
    unprotectedResources: [],
    protectedResourceMap: [
      ['https://graph.microsoft.com/v1.0/me', ['user.read']]
    ],
    logger: console
  };
}

export function MSALAngularConfigFactory() {
  return {
    popUp: false,
    consentScopes: ['user.read'],
    unprotectedResources: [],
    protectedResourceMap: [
      ['https://graph.microsoft.com/v1.0/me', ['user.read']]
    ]
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    MsalModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_CONFIG,
      useFactory: MSALConfigFactory
    },
    {
      provide: MSAL_CONFIG_ANGULAR,
      useFactory: MSALAngularConfigFactory
    },
    MsalService,
    BroadcastService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// Update the environment.ts file to simplify configuration:
// File: src/environments/environment.ts
export const environment = {
  production: false,
  clientId: 'YOUR_AZURE_CLIENT_ID', // Replace with your Azure AD client ID
  tenantId: 'YOUR_TENANT_ID', // Replace with your tenant ID
  graphEndpoint: 'https://graph.microsoft.com/v1.0/me'
};

// File: src/environments/environment.prod.ts
export const environment = {
  production: true,
  clientId: 'YOUR_AZURE_CLIENT_ID', // Replace with your Azure AD client ID
  tenantId: 'YOUR_TENANT_ID', // Replace with your tenant ID
  graphEndpoint: 'https://graph.microsoft.com/v1.0/me'
};

// Update the auth.guard.ts to use the BroadcastService as well
// File: src/app/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private msalService: MsalService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.msalService.getUser()) {
      return true;
    }
    
    this.msalService.loginRedirect({
      scopes: ['user.read']
    });
    return false;
  }
}

// Update home.component.ts to include appropriate cleanup
// File: src/app/home/home.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MsalService, BroadcastService } from '@azure/msal-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private subscription: Subscription;
  
  constructor(
    private msalService: MsalService,
    private broadcastService: BroadcastService
  ) { }

  ngOnInit() {
    this.isLoggedIn = !!this.msalService.getUser();
    
    // Subscribe to login changes
    this.subscription = this.broadcastService.subscribe('msal:loginSuccess', () => {
      this.isLoggedIn = true;
    });
  }
  
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

// No changes needed for graph.service.ts

// Update profile.component.ts to properly handle authentication events
// File: src/app/profile/profile.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GraphService } from '../graph.service';
import { MsalService, BroadcastService } from '@azure/msal-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: any;
  loading = true;
  error: string = null;
  private subscription: Subscription;
  
  constructor(
    private graphService: GraphService, 
    private msalService: MsalService,
    private broadcastService: BroadcastService
  ) { }

  ngOnInit() {
    // Only get profile if user is logged in
    if (this.msalService.getUser()) {
      this.getUserProfile();
    }
    
    // Listen for login events
    this.subscription = this.broadcastService.subscribe('msal:loginSuccess', () => {
      this.getUserProfile();
    });
  }
  
  getUserProfile() {
    this.loading = true;
    this.graphService.getUserProfile()
      .subscribe(
        (result) => {
          this.profile = result;
          this.loading = false;
        },
        (error) => {
          this.error = 'Error retrieving profile: ' + error.message;
          this.loading = false;
        }
      );
  }
  
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
