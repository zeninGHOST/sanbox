import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest, PopupRequest, AuthenticationResult } from '@azure/msal-browser'; // Import necessary types
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'azure-sso-angular8-demo';
  isIframe = false;
  loginDisplay = false;
  userName: string | undefined = undefined; // To store the user's name
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;

    this.setLoginDisplay();

    // Subscribe to MSAL broadcast events
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
      });

     // Optional: Log account changes
     this.msalBroadcastService.msalSubject$
     .pipe(
       filter((msg) => msg.eventType === 'ACCOUNT_ADDED' || msg.eventType === 'ACCOUNT_REMOVED'),
       takeUntil(this._destroying$)
     )
     .subscribe((result) => {
       console.log('MSAL Account Event:', result);
       this.setLoginDisplay(); // Update display based on account changes
     });
  }

  // Set the active account and update display
  checkAndSetActiveAccount() {
    let activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      // Assuming the first account is the one to use if none is active
      this.authService.instance.setActiveAccount(accounts[0]);
      activeAccount = accounts[0]; // Update activeAccount
    }

    this.setLoginDisplay(); // Update display based on active account
  }


  // Update the login display status and get username
  setLoginDisplay() {
    const accounts = this.authService.instance.getAllAccounts();
    this.loginDisplay = accounts.length > 0;
    if (this.loginDisplay) {
      const activeAccount = this.authService.instance.getActiveAccount();
      // Prefer name from claims, fallback to username
      this.userName = activeAccount?.name ?? activeAccount?.username;
    } else {
      this.userName = undefined;
    }
  }

  // Trigger login flow
  login() {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      if (this.msalGuardConfig.authRequest) {
        this.authService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            this.authService.instance.setActiveAccount(response.account);
            this.setLoginDisplay(); // Update display after login
          });
      } else {
        this.authService.loginPopup()
          .subscribe((response: AuthenticationResult) => {
            this.authService.instance.setActiveAccount(response.account);
            this.setLoginDisplay(); // Update display after login
          });
      }
    } else { // InteractionType.Redirect
      if (this.msalGuardConfig.authRequest) {
        this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
      } else {
        this.authService.loginRedirect();
      }
    }
  }

  // Trigger logout flow
  logout() {
    // You can choose popup or redirect logout
    // this.authService.logoutPopup({ mainWindowRedirectUri: "/" }); // For popup logout
    this.authService.logoutRedirect({ postLogoutRedirectUri: '/' }); // For redirect logout
  }

  // Unsubscribe from observables on component destruction
  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}

