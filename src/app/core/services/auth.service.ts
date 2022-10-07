import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import jwt_decode, { JwtPayload } from 'jwt-decode';

interface AccessTokenJwtPayload extends JwtPayload {
  userId: string;
}
interface RefreshTokenJwtPayload extends JwtPayload {
  userId: string;
  refreshTokenId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Create a new Http Client from HttpBackend, which dispatches requests directly to the backend, without going through the interceptor chain
  // So HTTP request done in this service won't be intercepted !
  private http!: HttpClient;
  accessTokenExpirationTimestamp: number = 0;
  refreshTokenExpirationTimestamp: number = 0;
  currentRouteRequiringAuth: string = "";
  redirectedToLogin: boolean = false;

  constructor(private handler: HttpBackend,
              private router: Router) {
    this.http = new HttpClient(handler);
    const accessToken = this.getAccessToken();
    if (accessToken) this.updateAccessTokenExpiration(accessToken);
    const refreshToken = this.getRefreshToken();
    if (refreshToken) this.updateRefreshTokenExpiration(refreshToken);
  }
  
  // Methods relative to API endpoints

  signup(email: string, password: string): void {
    const body: {email: string, password: string} = {email, password};
    this.http.post<{message: string}>(`${environment.apiUrl}/auth/signup`, body).pipe(
      take(1),
      tap(() => {
        console.log('User created !');
      }),
      catchError(error => {
        this.resetTokens();
        console.log('Caught in signup CatchError. Throwing error');
        throw new Error(error);
      })
    ).subscribe();
  }
  
  login(email: string, password: string): void {
    const refreshToken = this.getRefreshToken();
    const body: {email: string, password: string, refreshToken?: string} = refreshToken ? {email, password, refreshToken} : {email, password};
    this.http.post<{userId: string, accessToken: string, refreshToken: string}>(`${environment.apiUrl}/auth/login`, body).pipe(
      take(1),
      tap(loginResponse => {
        this.setUserId(loginResponse.userId);
        this.setAccessToken(loginResponse.accessToken);
        this.setRefreshToken(loginResponse.refreshToken);
        if (this.redirectedToLogin && this.currentRouteRequiringAuth !== "") {
          this.redirectedToLogin = false;
          this.router.navigate([this.currentRouteRequiringAuth]);
        }
      }),
      catchError(error => {
        this.resetTokens();
        console.log('Caught in login CatchError. Throwing error');
        console.log(error);
        throw new Error(error);
      })
    ).subscribe();
  }

  logOut(): void {
    const refreshToken = this.getRefreshToken();
    this.resetTokens();
    if (refreshToken) {
      this.http.post<{}>(`${environment.apiUrl}/auth/logout`, {refreshToken}).pipe(
        take(1),
        tap(() => {
          console.log('Successfully logged out of the backend');
        }),
        catchError(error => {
          console.log('Caught in logOut CatchError. Throwing error');
          throw new Error(error);
        })
      ).subscribe();
    }
  }
  
  refreshTokenObservable(token: string): Observable<{userId: string, accessToken: string, refreshToken: string}> {
    return this.http.post<{userId: string, accessToken: string, refreshToken: string}>(`${environment.apiUrl}/auth/refresh`, {refreshToken: token});
  }

  // Getter / Setters
  
  getUserId(): string | null {
    return localStorage.getItem("userId");
  }
  
  setUserId(id: string): void {
    window.localStorage.setItem("userId", id);
  }
  
  getAccessToken(): string | null {
    var hasExpired = false;
    if (this.accessTokenExpirationTimestamp !== 0) {
      hasExpired = this.accessTokenExpirationTimestamp < Date.now();
    }
    return hasExpired ? null : localStorage.getItem("accessToken");
  }
  
  setAccessToken(token: string): void {
    window.localStorage.setItem("accessToken", token);
    this.updateAccessTokenExpiration(token);
  }
  
  deleteAccessToken(): void {
    window.localStorage.removeItem("accessToken");
    this.accessTokenExpirationTimestamp = 0;
  }

  getRefreshToken(): string | null {
    var hasExpired = false;
    if (this.refreshTokenExpirationTimestamp !== 0) {
      hasExpired = this.refreshTokenExpirationTimestamp < Date.now();
    }
    return hasExpired ? null : localStorage.getItem("refreshToken");
  }
  
  setRefreshToken(token: string): void {
    window.localStorage.setItem("refreshToken", token);
    this.updateRefreshTokenExpiration(token);
  }

  // Other methods

  updateAccessTokenExpiration(token: string): void {
    // Retrieve expiration time and store it
    const decodedPayload = jwt_decode<AccessTokenJwtPayload>(token);
    if (decodedPayload === null) {
      console.error("Error when decoding accessToken : " + token);
    } else {
      const decodedPayloadExpiration = decodedPayload.exp;
      if (decodedPayloadExpiration === undefined) {
        console.error("Error when reading accessToken payload (no exp field) : " + decodedPayload);
      } else {
        this.accessTokenExpirationTimestamp = decodedPayloadExpiration * 1000;
        return;
      }
    }
    this.accessTokenExpirationTimestamp = 0;
  }

  updateRefreshTokenExpiration(token: string): void {
    // Retrieve expiration time and store it
    const decodedPayload = jwt_decode<RefreshTokenJwtPayload>(token);
    if (decodedPayload === null) {
      console.error("Error when decoding refreshToken : " + token);
    } else {
      const decodedPayloadExpiration = decodedPayload.exp;
      if (decodedPayloadExpiration === undefined) {
        console.error("Error when reading refreshToken payload (no exp field) : " + decodedPayload);
      } else {
        this.refreshTokenExpirationTimestamp = decodedPayloadExpiration * 1000;
        return;
      }
    }
    this.refreshTokenExpirationTimestamp = 0;
  }

  redirectToLogin(): void {
    this.redirectedToLogin = true;
    this.router.navigate(['login']);
  }
  
  resetTokens(): void {
    window.localStorage.removeItem("userId");
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    this.accessTokenExpirationTimestamp = 0;
    this.refreshTokenExpirationTimestamp = 0;
  }
}