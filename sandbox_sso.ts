// This is a complete Angular 8 project demonstrating Azure SSO integration
// I'll structure this as a set of files with explanations for each

// 1. First, let's set up the project structure
// File: package.json
{
  "name": "angular-azure-sso-demo",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "~8.2.14",
    "@angular/common": "~8.2.14",
    "@angular/compiler": "~8.2.14",
    "@angular/core": "~8.2.14",
    "@angular/forms": "~8.2.14",
    "@angular/platform-browser": "~8.2.14",
    "@angular/platform-browser-dynamic": "~8.2.14",
    "@angular/router": "~8.2.14",
    "@azure/msal-angular": "^0.1.4",
    "msal": "^1.3.3",
    "rxjs": "~6.4.0",
    "tslib": "^1.10.0",
    "zone.js": "~0.9.1"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "~0.803.29",
    "@angular/cli": "~8.3.29",
    "@angular/compiler-cli": "~8.2.14",
    "@angular/language-service": "~8.2.14",
    "@types/node": "~8.9.4",
    "@types/jasmine": "~3.3.8",
    "@types/jasminewd2": "~2.0.3",
    "codelyzer": "^5.0.0",
    "jasmine-core": "~3.4.0",
    "jasmine-spec-reporter": "~4.2.1",
    "karma": "~4.1.0",
    "karma-chrome-launcher": "~2.2.0",
    "karma-coverage-istanbul-reporter": "~2.0.1",
    "karma-jasmine": "~2.0.1",
    "karma-jasmine-html-reporter": "^1.4.0",
    "protractor": "~5.4.0",
    "ts-node": "~7.0.0",
    "tslint": "~5.15.0",
    "typescript": "~3.5.3"
  }
}

// 2. Set up environment configuration
// File: src/environments/environment.ts
export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: 'YOUR_AZURE_CLIENT_ID', // Replace with your Azure AD client ID
      authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with your tenant ID
      redirectUri: 'http://localhost:4200/',
      navigateToLoginRequestUrl: true
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false
    }
  },
  apiProtectedResourceMap: {
    'https://graph.microsoft.com/v1.0/me': ['user.read']
  },
  graphEndpoint: 'https://graph.microsoft.com/v1.0/me'
};

// File: src/environments/environment.prod.ts
export const environment = {
  production: true,
  msalConfig: {
    auth: {
      clientId: 'YOUR_AZURE_CLIENT_ID', // Replace with your Azure AD client ID
      authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // Replace with your tenant ID
      redirectUri: 'http://localhost:4200/',
      navigateToLoginRequestUrl: true
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false
    }
  },
  apiProtectedResourceMap: {
    'https://graph.microsoft.com/v1.0/me': ['user.read']
  },
  graphEndpoint: 'https://graph.microsoft.com/v1.0/me'
};

// 3. Configure the Angular module
// File: src/app/app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { MsalModule, MsalInterceptor } from '@azure/msal-angular';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
];

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
    MsalModule.forRoot(environment.msalConfig)
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// 4. Create an Auth Guard service
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
    if (this.msalService.getAccount()) {
      return true;
    }
    
    this.msalService.loginRedirect({
      scopes: ['user.read']
    });
    return false;
  }
}

// 5. Create a service for Graph API calls
// File: src/app/graph.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  constructor(private http: HttpClient) { }

  getUserProfile(): Observable<any> {
    return this.http.get(environment.graphEndpoint);
  }
}

// 6. Create the app component
// File: src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Azure SSO Demo';
  isLoggedIn = false;
  
  constructor(private msalService: MsalService, private router: Router) {}
  
  ngOnInit() {
    this.isLoggedIn = !!this.msalService.getAccount();
    
    // Handle redirect callback
    this.msalService.handleRedirectCallback((authError, response) => {
      if (authError) {
        console.error('Authentication error:', authError);
        return;
      }
      
      console.log('Authentication successful');
      this.isLoggedIn = true;
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
}

// File: src/app/app.component.html
<div class="container">
  <header>
    <h1>{{ title }}</h1>
    <nav>
      <ul>
        <li><a routerLink="/">Home</a></li>
        <li *ngIf="isLoggedIn"><a routerLink="/profile">Profile</a></li>
      </ul>
    </nav>
    <div class="auth-buttons">
      <button *ngIf="!isLoggedIn" (click)="login()">Sign In</button>
      <button *ngIf="isLoggedIn" (click)="logout()">Sign Out</button>
    </div>
  </header>
  
  <main>
    <router-outlet></router-outlet>
  </main>
</div>

// File: src/app/app.component.css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

nav li {
  margin-right: 20px;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

nav a:hover {
  color: #0078d4;
}

button {
  background-color: #0078d4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #006abb;
}

// 7. Create the Home component
// File: src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  
  constructor(private msalService: MsalService) { }

  ngOnInit() {
    this.isLoggedIn = !!this.msalService.getAccount();
  }
}

// File: src/app/home/home.component.html
<div class="home-container">
  <h2>Welcome to the Azure SSO Demo</h2>
  
  <div *ngIf="!isLoggedIn">
    <p>This application demonstrates how to integrate Azure Active Directory Single Sign-On with an Angular 8 application running on localhost.</p>
    <p>Click the Sign In button in the header to authenticate with your Azure AD account.</p>
  </div>
  
  <div *ngIf="isLoggedIn">
    <p>You are successfully logged in with Azure SSO!</p>
    <p>Your client ID is working correctly with localhost.</p>
    <p>Visit the Profile page to see information retrieved from Microsoft Graph API.</p>
  </div>
</div>

// File: src/app/home/home.component.css
.home-container {
  padding: 20px;
}

// 8. Create the Profile component
// File: src/app/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { GraphService } from '../graph.service';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: any;
  loading = true;
  error: string = null;
  
  constructor(private graphService: GraphService, private msalService: MsalService) { }

  ngOnInit() {
    this.getUserProfile();
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
}

// File: src/app/profile/profile.component.html
<div class="profile-container">
  <h2>Your Azure AD Profile</h2>
  
  <div *ngIf="loading" class="loading">
    Loading profile data...
  </div>
  
  <div *ngIf="error" class="error">
    {{ error }}
  </div>
  
  <div *ngIf="profile && !loading" class="profile-data">
    <div class="profile-field">
      <strong>Display Name:</strong> {{ profile.displayName }}
    </div>
    <div class="profile-field">
      <strong>Email:</strong> {{ profile.mail || profile.userPrincipalName }}
    </div>
    <div class="profile-field">
      <strong>User ID:</strong> {{ profile.id }}
    </div>
    <div class="profile-field">
      <strong>Job Title:</strong> {{ profile.jobTitle || 'Not specified' }}
    </div>
    
    <div class="successful-test">
      <p>✅ Your Azure SSO integration is working successfully on localhost!</p>
      <p>Client ID verification complete.</p>
    </div>
  </div>
</div>

// File: src/app/profile/profile.component.css
.profile-container {
  padding: 20px;
}

.loading {
  margin: 20px 0;
  font-style: italic;
}

.error {
  margin: 20px 0;
  padding: 10px;
  background-color: #ffdddd;
  border-left: 5px solid #f44336;
}

.profile-data {
  margin: 20px 0;
}

.profile-field {
  margin-bottom: 10px;
}

.successful-test {
  margin-top: 30px;
  padding: 15px;
  background-color: #e6f7e6;
  border-left: 5px solid #4CAF50;
}

// 9. Main index.html file
// File: src/index.html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Azure SSO Demo</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>

// 10. Main styles.css file
// File: src/styles.css
/* You can add global styles to this file, and also import other style files */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

/* Global button styles */
button {
  cursor: pointer;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
}
