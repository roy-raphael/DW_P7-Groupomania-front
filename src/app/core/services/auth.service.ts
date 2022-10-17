import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { User } from '../models/user.model';

interface AccessTokenJwtPayload extends JwtPayload {
  userId: string;
}
interface RefreshTokenJwtPayload extends JwtPayload {
  userId: string;
  refreshTokenId: string;
}
enum Role {
  User = "USER",
  Admin = "ADMIN"
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http!: HttpClient;
  private user: User | null = null;
  private accessTokenExpirationTimestamp: number = 0;
  private refreshTokenExpirationTimestamp: number = 0;
  private redirectedToLogin: boolean = false;
  private hasUserAdminRole = false;
  currentRouteRequiringAuth: string = "";
  
  constructor(private handler: HttpBackend,
    private router: Router) {
    // Create a new Http Client from HttpBackend, which dispatches requests directly to the backend, without going through the interceptor chain
    // So HTTP request done in this service won't be intercepted !
    this.http = new HttpClient(handler);
    const accessToken = this.getAccessToken();
    if (accessToken) this.updateAccessTokenExpiration(accessToken);
    const refreshToken = this.getRefreshToken();
    if (refreshToken) this.updateRefreshTokenExpiration(refreshToken);
    this.retrieveUser();
  }
  
  // Methods relative to API endpoints

  signup(email: string, password: string, firstName: string, surName: string, pseudo: string): void {
    var body: {email: string, password: string, firstName: string, surName: string, pseudo?: string} = {email, password, firstName, surName, pseudo};
    if (pseudo === '') delete body.pseudo;
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
  
  login(email: string, password: string): Observable<{user: User, accessToken: string, refreshToken: string}> {
    const refreshToken = this.getRefreshToken();
    const body: {email: string, password: string, refreshToken?: string} = refreshToken ? {email, password, refreshToken} : {email, password};
    return this.http.post<{user: User, accessToken: string, refreshToken: string}>(`${environment.apiUrl}/auth/login`, body).pipe(
      take(1),
      tap(loginResponse => {
        this.setUser(loginResponse.user);
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
        throw error;
      })
    );
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
  
  refreshTokenObservable(token: string): Observable<{user: User, accessToken: string, refreshToken: string}> {
    return this.http.post<{user: User, accessToken: string, refreshToken: string}>(`${environment.apiUrl}/auth/refresh`, {refreshToken: token});
  }

  // Getter / Setters

  retrieveUser(): void {
    const userString = window.localStorage.getItem("user");
    if (userString == null) this.user = null;
    else this.user = JSON.parse(userString) as User;
  }

  getUser(): User | null {
    return this.user;
  }

  setUser(user: User): void {
    this.user = user;
    this.hasUserAdminRole = user.role === Role.Admin;
    window.localStorage.setItem("user", JSON.stringify(user));
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

  isUserAdmin(): boolean {
    return this.hasUserAdminRole;
  }

  // Other methods

  getUserId(): string | null {
    const user = this.getUser();
    if (!user) return null;
    const userId = user.id;
    if (!userId) return null;
    return userId;
  }

  isUserAuthor(authorId: string): boolean {
    if (this.user == null) return false;
    return authorId === this.user.id;
  }

  containsCurrentUser(userArray: {id: string}[]): boolean {
    if (this.user == null) return false;
    for (let user of userArray) {
      if (user.id === this.user.id) return true;
    }
    return false;
  }

  canEditAndDeletePost(postAuthorId: string): boolean {
    return this.isUserAdmin() || this.isUserAuthor(postAuthorId)
  }

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

  redirectTo404(): void {
    this.router.navigate(['404'], {skipLocationChange:true});
  }
  
  resetTokens(): void {
    this.user = null;
    this.hasUserAdminRole = false;
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    this.accessTokenExpirationTimestamp = 0;
    this.refreshTokenExpirationTimestamp = 0;
  }
}