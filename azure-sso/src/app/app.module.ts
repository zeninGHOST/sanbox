import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { MsalModule, MsalRedirectComponent, MsalGuard, MsalInterceptor } from '@azure/msal-angular';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { environment } from '../environments/environment';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MsalModule.forRoot(new PublicClientApplication({
      auth: {
        clientId: environment.msalConfig.auth.clientId,
        authority: environment.msalConfig.auth.authority,
        redirectUri: environment.msalConfig.auth.redirectUri,
      },
      cache: {
        cacheLocation: environment.msalConfig.cache.cacheLocation,
        storeAuthStateInCookie: isIE,
      }
    }), {
      interactionType: InteractionType.Redirect,
      authRequest: {
        scopes: environment.apiConfig.scopes
      }
    }, {
      interactionType: InteractionType.Redirect,
      protectedResourceMap: new Map([
        [environment.apiConfig.uri, environment.apiConfig.scopes]
      ])
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalGuard
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
