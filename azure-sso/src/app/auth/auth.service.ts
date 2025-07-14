import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private msalService: MsalService) { }

  isLoggedIn(): boolean {
    return this.msalService.instance.getActiveAccount() != null;
  }

  login(): Observable<AuthenticationResult> {
    return from(this.msalService.loginPopup({
      scopes: environment.apiConfig.scopes
    }));
  }

  logout(): void {
    this.msalService.logout();
  }

  getAccount(): AccountInfo | null {
    return this.msalService.instance.getActiveAccount();
  }

  getUserInfo(): any {
    const account = this.getAccount();
    if (account) {
      return {
        name: account.name,
        username: account.username,
        email: account.username,
        id: account.localAccountId
      };
    }
    return null;
  }
}
