import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, take, tap } from 'rxjs';
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
  accessTokenExpirationTimestamp: number = 0;
  refreshTokenExpirationTimestamp: number = 0;

  constructor(private http: HttpClient,
              private router: Router) {
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
    const body: {email: string, password: string} = {email, password};
    this.http.post<{userId: string, accessToken: string, refreshToken: string}>(`${environment.apiUrl}/auth/login`, body).pipe(
      take(1),
      tap(loginResponse => {
        this.setUserId(loginResponse.userId);
        this.setAccessToken(loginResponse.accessToken);
        this.setRefreshToken(loginResponse.refreshToken);
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
    this.http.post<{}>(`${environment.apiUrl}/auth/logout`, {}).pipe(
      take(1),
      tap(() => {
        this.resetTokens();
      }),
      catchError(error => {
        console.log('Caught in logOut CatchError. Throwing error');
        throw new Error(error);
      })
    ).subscribe();
  }
  
  refreshTokenObservable(): Observable<{userId: string, accessToken: string, refreshToken: string}> {
    return this.http.post<{userId: string, accessToken: string, refreshToken: string}>(`${environment.apiUrl}/auth/refresh`, {});
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
      hasExpired = this.accessTokenExpirationTimestamp > Date.now();
    }
    return hasExpired ? null : localStorage.getItem("accessToken");
  }
  
  setAccessToken(token: string): void {
    window.localStorage.setItem("accessToken", token);
    this.updateAccessTokenExpiration(token);
  }

  getRefreshToken(): string | null {
    var hasExpired = false;
    if (this.refreshTokenExpirationTimestamp !== 0) {
      hasExpired = this.refreshTokenExpirationTimestamp > Date.now();
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