import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Import MSAL modules
import {
  MsalModule,
  MsalInterceptor,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MsalGuard, // Import MsalGuard
  MsalBroadcastService, // Import MsalBroadcastService
  MsalService // Import MsalService
} from '@azure/msal-angular';
import {
  PublicClientApplication, // Updated import
  InteractionType, // Needed for interceptor config
  BrowserCacheLocation // Optional: For cache configuration
} from '@azure/msal-browser'; // Use @azure/msal-browser for configuration objects

import { HomeComponent } from './home/home.component'; // Assuming you have a HomeComponent

// --- MSAL Configuration ---
// This function creates the MSAL instance.
// You MUST replace placeholders with your actual Azure AD app registration details.
export function MSALInstanceFactory(): PublicClientApplication {
  return new PublicClientApplication({
    auth: {
      // REQUIRED: 'Application (client) ID' of your app registration in Azure portal
      clientId: 'YOUR_CLIENT_ID', // <-- REPLACE THIS
      // OPTIONAL: 'Directory (tenant) ID' or common/organizations/consumers
      // 'common' allows work/school accounts and personal Microsoft accounts
      authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // <-- REPLACE THIS or use 'common'/'organizations'
      // REQUIRED: Must match the 'Redirect URI' configured in your Azure app registration
      redirectUri: 'http://localhost:4200', // Default Angular dev server port
      // OPTIONAL: Only needed for single-page apps using hash routing
      // navigateToLoginRequestUrl: false,
    },
    cache: {
      // OPTIONAL: Configures cache location. 'localStorage' is default.
      cacheLocation: BrowserCacheLocation.LocalStorage,
      // OPTIONAL: Prevent clearing cache on redirect. Useful for debugging.
      // storeAuthStateInCookie: isIE, // Set to true for Internet Explorer 11
    },
    system: {
      loggerOptions: { // OPTIONAL: For detailed MSAL logging
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) {
            return;
          }
          // console.log('MSAL Log:', level, message); // Uncomment to see MSAL logs
        },
        piiLoggingEnabled: false,
        logLevel: 'Verbose', // LogLevel.Verbose
      }
    }
  });
}

// This function configures the MSAL Interceptor.
// It automatically attaches access tokens to outgoing HTTP requests to protected resources.
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  // Define the scopes required for your protected API resources.
  // Example: If you have an API registered in Azure AD, add its scope here.
  // For Microsoft Graph, use scopes like 'user.read'.
  const protectedResourceMap = new Map<string, Array<string>>();
  // Example for Microsoft Graph:
  // protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']);
  // Example for a custom API:
  // protectedResourceMap.set('https://yourapi.domain.com/api', ['api://YOUR_API_CLIENT_ID/your.scope']);

  return {
    interactionType: InteractionType.Redirect, // Or InteractionType.Popup
    protectedResourceMap
  };
}

// This function configures the MSAL Guard.
// It protects routes, ensuring the user is authenticated before accessing them.
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect, // Or InteractionType.Popup
    authRequest: {
      // Scopes required just for login. 'openid', 'profile', 'User.Read' are common defaults.
      scopes: ['user.read']
    }
  };
}
// --- End MSAL Configuration ---


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent // Declare HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, // Add HttpClientModule
    MsalModule // Add MsalModule here
  ],
  providers: [
    // MSAL Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    // MSAL Instance, Interceptor Config, Guard Config
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    // MSAL Services
    MsalService,
    MsalGuard, // Provide MsalGuard
    MsalBroadcastService // Provide MsalBroadcastService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

