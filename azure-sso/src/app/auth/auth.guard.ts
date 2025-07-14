import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MsalService } from '@azure/msal-angular';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private msalService: MsalService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const activeAccount = this.msalService.instance.getActiveAccount();
    
    if (activeAccount) {
      return true;
    } else {
      // Trigger login if not authenticated
      return this.msalService.loginPopup({ scopes: ['user.read'] }).pipe(
        map((result) => {
          return true;
        })
      );
    }
  }
}
