import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Save the current route in case we need to redirect to login (so we can redirect to the wanted route after login)
    this.auth.currentRouteRequiringAuth = state.url;
    const token = this.auth.getRefreshToken();
    if (token) {
      return true;
    } else {
      this.auth.redirectToLogin();
      return false;
    }
  }
}