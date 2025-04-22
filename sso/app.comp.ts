import { Component, OnInit, OnDestroy } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { Account, AuthError, AuthenticationResult } from 'msal'; // Import v1 types from 'msal'
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'azure-sso-angular8-demo';
  isIframe = false;
  loggedIn = false; // Use a simple boolean for login status
  userName: string | undefined = undefined;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    // Inject MsalService directly
    private authService: MsalService,
    private broadcastService: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;
    this.checkoutAccount(); // Check initial login status

    // Subscribe to MSAL v1 broadcast events
    this.broadcastService.subscribe('msal:loginSuccess', (payload: AuthenticationResult) => {
      console.log('MSAL Login Success:', payload);
      // Ensure account is set after successful login payload
      if (payload && payload.account) {
        // *** CORRECTED: Call setActiveAccount directly on authService ***
        this.authService.setActiveAccount(payload.account);
      }
      this.checkoutAccount();
    });

    this.broadcastService.subscribe('msal:loginFailure', (payload: AuthError) => {
      console.error('MSAL Login Failure:', payload);
      this.checkoutAccount(); // Update status even on failure
    });

    this.broadcastService.subscribe('msal:logoutSuccess', () => {
        console.log('MSAL Logout Success');
        this.checkoutAccount();
    });

    this.broadcastService.subscribe('msal:acquireTokenSuccess', (payload: AuthenticationResult) => {
        console.log('MSAL Acquire Token Success');
    });

     this.broadcastService.subscribe('msal:acquireTokenFailure', (payload: AuthError) => {
        console.error('MSAL Acquire Token Failure:', payload);
        if (payload.errorMessage.indexOf('consent_required') !== -1 || payload.errorMessage.indexOf('interaction_required') !== -1) {
           // *** CORRECTED: Call acquireTokenRedirect directly on authService ***
           this.authService.acquireTokenRedirect({
             scopes: payload.scopes || ['user.read']
           });
        }
    });

    // *** CORRECTED: Call handleRedirectCallback directly on authService ***
    this.authService.handleRedirectCallback((authError: AuthError | null, response: AuthenticationResult | null) => {
        if (authError) {
            console.error('Redirect Error:', authError);
            return;
        }
        console.log('Redirect Success:', response);
        if (response && response.account) {
           // *** CORRECTED: Call setActiveAccount directly on authService ***
           this.authService.setActiveAccount(response.account);
        }
        this.checkoutAccount();
    });

    // *** CORRECTED: Call isCallback directly on authService ***
    // Note: isCallback might not be directly exposed on MsalService in all v1 versions.
    // handleRedirectCallback usually covers the necessary logic.
    // If you encounter issues, this check might need adjustment or removal,
    // relying solely on handleRedirectCallback.
    // For now, assuming it might exist or gracefully handled if not.
    // A safer approach might be to remove this explicit check if handleRedirectCallback works.
    // Let's comment it out for now as handleRedirectCallback should suffice.
    /*
    if (this.authService.isCallback(window.location.hash)) { // Check if this method exists on your MsalService version
        console.log('MSAL is processing redirect hash...');
        // handleRedirectCallback will be invoked
    } else {
        // If not a callback, check the initial account status
        this.checkoutAccount();
    }
    */
    // Always check account on init, handleRedirectCallback will update if it was a redirect.
    this.checkoutAccount();
  }

  // Check current user account status
  checkoutAccount() {
    // *** CORRECTED: Call getAccount directly on authService ***
    const account = this.authService.getAccount();
    this.loggedIn = !!account;
    if (account) {
      this.userName = account.idTokenClaims?.name ?? account.userName;
      // *** CORRECTED: Call getActiveAccount/getAllAccounts/setActiveAccount directly ***
      if (!this.authService.getActiveAccount() && this.authService.getAllAccounts().length === 1) {
          this.authService.setActiveAccount(account);
      }
    } else {
      this.userName = undefined;
    }
    console.log('Checked Account:', account, 'Logged In:', this.loggedIn);
  }

  // Trigger login
  login() {
    // *** CORRECTED: Call loginRedirect directly on authService ***
    this.authService.loginRedirect({
        scopes: ['user.read']
    });
    // Or use loginPopup:
    // this.authService.loginPopup({ scopes: ['user.read'] })
    //   .then(...)
    //   .catch(...);
  }

  // Trigger logout
  logout() {
    // *** CORRECTED: Call logout directly on authService ***
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
    // Unsubscribe logic for broadcast service might be needed depending on exact v1 version/implementation
    // For simplicity, relying on component destruction.
  }
}

