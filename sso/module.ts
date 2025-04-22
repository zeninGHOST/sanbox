import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Import MSAL v1 modules
import {
    MsalModule,
    MsalInterceptor,
    MSAL_CONFIG, // Use MSAL_CONFIG for v1
    MSAL_CONFIG_ANGULAR, // Use MSAL_CONFIG_ANGULAR for v1
    MsalService,
    MsalGuard,
    MsalBroadcastService // Still used in v1 for broadcasting events
} from '@azure/msal-angular'; // v1 uses @azure/msal-angular
import { Configuration } from 'msal'; // Import Configuration from 'msal' v1
import { MsalAngularConfiguration } from '@azure/msal-angular'; // Import MsalAngularConfiguration

import { HomeComponent } from './home/home.component';
import { LogLevel } from 'msal'; // Import LogLevel from 'msal' v1

// --- MSAL v1 Configuration ---

// MSAL Core Configuration (msal.js)
export function MSALConfigFactory(): Configuration {
  return {
    auth: {
      // REQUIRED: 'Application (client) ID' of your app registration in Azure portal
      clientId: 'YOUR_CLIENT_ID', // <-- REPLACE THIS
      // OPTIONAL: 'Directory (tenant) ID' or common/organizations/consumers
      authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID', // <-- REPLACE THIS or use 'common'/'organizations'
      // REQUIRED: Must match the 'Redirect URI' configured in your Azure app registration
      redirectUri: 'http://localhost:4200', // Default Angular dev server port
      // OPTIONAL: The URI to redirect to after logout
      postLogoutRedirectUri: 'http://localhost:4200',
      // OPTIONAL: Used to indicate that navigation to the login request URL is handled by the developer. Set to true to prevent looping.
      navigateToLoginRequestUrl: true,
    },
    cache: {
      // Configures cache location. 'localStorage' is default.
      cacheLocation: 'localStorage', // Options: 'localStorage', 'sessionStorage'
      // Set to true if you want navigation prompts to wait for MSAL operations to complete
      storeAuthStateInCookie: false, // Set to true for IE11 issues, generally false
    },
    // OPTIONAL: Log details for debugging
    system: {
      logger: new Logger(loggerCallback, {
         correlationId: '1234', // Example correlation ID
         level: LogLevel.Verbose, // Log levels: Error, Warning, Info, Verbose
         piiLoggingEnabled: false // Set to true ONLY for debugging, logs personal info
        })
    }
  };
}

// MSAL Angular Configuration (msal-angular)
export function MSALAngularConfigFactory(): MsalAngularConfiguration {
  return {
    // Scopes for initial login request. These are consented upfront.
    consentScopes: [
      'user.read', // Basic profile access
      'openid',
      'profile',
      // Add other scopes needed for your application immediately after login
      // e.g., 'api://YOUR_API_CLIENT_ID/your.scope'
    ],
    // Scopes to protect resources. The interceptor attaches tokens with these scopes.
    // Keys are the resource endpoints (can be partial URLs), values are the scopes.
    protectedResourceMap: new Map<string, Array<string>>([
      // Example for Microsoft Graph:
      ['https://graph.microsoft.com/v1.0/me', ['user.read']],
      // Example for a custom API:
      // ['https://yourapi.domain.com/api', ['api://YOUR_API_CLIENT_ID/your.scope']]
    ]),
    // Set to true for handling specific AAD B2C user flows (optional)
    // isAngular: true, // Deprecated in later v1 versions, usually not needed
    // URL patterns to *exclude* from automatic token acquisition by the interceptor
    unprotectedResources: [
        'https://www.microsoft.com/en-us/.' // Example: Exclude external URLs
    ],
    // Extra query parameters for authentication requests (optional)
    // extraQueryParameters: { domain_hint: 'organizations' }
  };
}

// MSAL Logger Callback Function
export function loggerCallback(logLevel: LogLevel, message: string, piiLoggingEnabled: boolean) {
    // console.log('MSAL Log:', LogLevel[logLevel], message); // Uncomment to see MSAL logs
}

// Custom Logger class required by MSAL v1 Configuration
export class Logger {
    constructor(
        private callback: (level: LogLevel, message: string, containsPii: boolean) => void,
        private options: { level: LogLevel, piiLoggingEnabled: boolean, correlationId?: string }
    ) {}

    error(message: string): void {
        if (this.options.level >= LogLevel.Error) {
            this.callback(LogLevel.Error, message, this.options.piiLoggingEnabled);
        }
    }
    warning(message: string): void {
         if (this.options.level >= LogLevel.Warning) {
            this.callback(LogLevel.Warning, message, this.options.piiLoggingEnabled);
        }
    }
    info(message: string): void {
         if (this.options.level >= LogLevel.Info) {
            this.callback(LogLevel.Info, message, this.options.piiLoggingEnabled);
        }
    }
    verbose(message: string): void {
         if (this.options.level >= LogLevel.Verbose) {
            this.callback(LogLevel.Verbose, message, this.options.piiLoggingEnabled);
        }
    }
    // Implement other methods if needed based on MSAL's internal logger interface
    isPiiLoggingEnabled(): boolean {
        return this.options.piiLoggingEnabled;
    }
}
// --- End MSAL v1 Configuration ---


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    // Initialize MsalModule with the factories
    MsalModule.forRoot(MSALConfigFactory(), MSALAngularConfigFactory())
  ],
  providers: [
    // MSAL Interceptor for attaching tokens
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    // MSAL Services are now provided by MsalModule.forRoot()
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

