import { Injectable } from '@angular/core';
import * as auth0 from 'auth0-js';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, bindNodeCallback, of } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  auth0 = new auth0.WebAuth({
    clientID: environment.auth0.clientID,
    domain: environment.auth0.domain,
    responseType: 'token id_token',
    redirectUri: environment.auth0.redirectUri,
    scope: 'openid profile email'
  });

  // Track whether or not to renew token
  private _authFlag = 'isLoggedIn';
  private _userProfileFlag = 'userProfile';

  // Store authentication data
  // Create stream for token
  token$: Observable<string>;
  // Create stream for user profile data
  userProfile$ = new BehaviorSubject<any>(null);

  // Authentication Navigation
  onAuthSuccessUrl = '/';
  onAuthFailureUrl = '/';
  logoutUrl =  environment.auth0.logoutUrl;

  // Create observable of Auth0 parseHash method to gather auth results
  parseHash$ = bindNodeCallback(this.auth0.parseHash.bind(this.auth0));
  // Create observable of Auth0 checkSession method to
  // verify authorization server session and renew tokens
  checkSession$ = bindNodeCallback(this.auth0.checkSession.bind(this.auth0));

  constructor(private router: Router) {
    const userProfile = localStorage.getItem(this._userProfileFlag);
    if (userProfile) {
      this.userProfile$.next(JSON.parse(userProfile));
    }
  }

  login = () => this.auth0.authorize();

  handleLoginCallback = () => {
    if (window.location.hash && !this.authenticated) {
      this.parseHash$().subscribe({
        next: authResult => {
          this._setAuth(authResult);
          window.location.hash = '';
          this.router.navigate([this.onAuthSuccessUrl]);
        },
        error: err => this._handleError(err)
      });
    }
  }

  private _setAuth = authResult => {
    // Save authentication data and update login status subject
    // Observable of token
    this.token$ = of(authResult.accessToken);

    const userProfile = authResult.idTokenPayload;
    // Emit value for user data subject
    this.userProfile$.next(userProfile);
    // save userProfile in localStorage
    localStorage.setItem(this._userProfileFlag, JSON.stringify(userProfile));

    // Set flag in local storage stating this app is logged in
    localStorage.setItem(this._authFlag, JSON.stringify(true));
  }

  get authenticated(): boolean {
    return JSON.parse(localStorage.getItem(this._authFlag));
  }

  renewAuth() {
    if (this.authenticated) {
      this.checkSession$({}).subscribe({
        next: authResult => this._setAuth(authResult),
        error: err => {
          localStorage.removeItem(this._authFlag);
          localStorage.removeItem(this._userProfileFlag);
          this.router.navigate([this.onAuthFailureUrl]);
        }
      });
    }
  }

  logout = () => {
    // Set authentication status flag in local storage to false
    localStorage.setItem(this._authFlag, JSON.stringify(false));
    // remove the userProfile data
    localStorage.removeItem(this._userProfileFlag);

    // This does a refresh and redirects back to the homepage
    // Make sure you have the logout URL in your Auth0
    // Dashboard Application settings in Allowed Logout URLs
    this.auth0.logout({
      returnTo: this.logoutUrl,
      clientID: environment.auth0.clientID
    });
  };

  // Utility functions

  private _handleError = err => {
    if (err.error_description) {
      console.error(`Error: ${err.error_description}`);
    } else {
      console.error(`Error: ${JSON.stringify(err)}`);
    }
  };
}