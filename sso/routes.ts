import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular'; // Import MsalGuard
import { HomeComponent } from './home/home.component'; // Import HomeComponent
import { BrowserUtils } from '@azure/msal-browser'; // Import BrowserUtils for handling redirects

const routes: Routes = [
  // Route protected by MsalGuard: User must be logged in to access.
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [MsalGuard] // Protect this route
  },
  // Default route: Redirect to home if logged in, otherwise MSAL handles login prompt.
  // MsalGuard on the root path might interfere with the initial redirect handling.
  // It's often better to have an unprotected landing page or redirect logic in AppComponent.
  // For simplicity here, we redirect to the protected 'home' route.
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  // Example of a public route (optional)
  // {
  //   path: 'public',
  //   component: PublicPageComponent
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Handle redirects from Azure AD after login
    initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() ? 'enabledNonBlocking' : 'disabled' // Recommended settings
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

