import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, ReplaySubject, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';

enum Role {
  User = "USER",
  Admin = "ADMIN"
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _http!: HttpClient;
  private _userId: string | null = null;
  private _redirectedToLogin: boolean = false;
  private _isUserAdmin = false;
  private _userSubject: ReplaySubject<User | null> = new ReplaySubject(1); // Store only the last value
  currentRouteRequiringAuth: string = "";
  
  constructor(private handler: HttpBackend,
              private router: Router) {
    this.setUser(this.getUser()); // Retrieve and check the user (and save userId)
    // Create a new Http Client from HttpBackend, which dispatches requests directly to the backend, without going through the interceptor chain
    // So HTTP request done in this service won't be intercepted !
    this._http = new HttpClient(handler);
  }
  
  // Methods relative to API endpoints

  signup(email: string, password: string, firstName: string, surName: string, pseudo: string): Observable<{message: string}> {
    var body: {email: string, password: string, firstName: string, surName: string, pseudo?: string} = {email, password, firstName, surName, pseudo};
    if (pseudo === '') delete body.pseudo;
    return this._http.post<{message: string}>(`${environment.apiUrl}/auth/signup`, body).pipe(
      take(1),
      tap(() => {
        console.log('User created !');
      }),
      catchError(error => {
        this.resetAuthInfos();
        if (error instanceof HttpErrorResponse) {
          const httpError = error.error;
          const errorMessage = (httpError != null && httpError.error != null && httpError.error.message != null) ? httpError.error.message : error.message;
          console.log("Error during signup : " + errorMessage);
        } else {
          console.log('Error (non-HTTP) during signup');
        }
        throw error;
      })
    );
  }
  
  login(email: string, password: string): Observable<{user: User, accessToken: string, refreshToken: string}> {
    const refreshToken = this.getRefreshToken();
    const body: {email: string, password: string, refreshToken?: string} = refreshToken ? {email, password, refreshToken} : {email, password};
    return this._http.post<{user: User, accessToken: string, refreshToken: string}>(`${environment.apiUrl}/auth/login`, body).pipe(
      take(1),
      tap(loginResponse => {
        this.setUser(loginResponse.user);
        this.setAccessToken(loginResponse.accessToken);
        this.setRefreshToken(loginResponse.refreshToken);
        if (this._redirectedToLogin && this.currentRouteRequiringAuth !== "") {
          this._redirectedToLogin = false;
          this.router.navigate([this.currentRouteRequiringAuth]);
        } else {
          this.router.navigate(['']);
        }
      }),
      catchError(error => {
        this.resetAuthInfos();
        if (error instanceof HttpErrorResponse) {
          const httpError = error.error;
          const errorMessage = (httpError != null && httpError.error != null && httpError.error.message != null) ? httpError.error.message : error.message;
          console.log("Error during login : " + errorMessage);
        } else {
          console.log('Error (non-HTTP) during login');
        }
        throw error;
      })
    );
  }

  logOut(): void {
    const refreshToken = this.getRefreshToken();
    this.resetAuthInfos();
    if (refreshToken) {
      this._http.post<{}>(`${environment.apiUrl}/auth/logout`, {refreshToken}).pipe(
        take(1),
        tap(() => {
          console.log('Successfully logged out of the backend');
        }),
        catchError(error => {
          if (error instanceof HttpErrorResponse) {
            const httpError = error.error;
            const errorMessage = (httpError != null && httpError.error != null && httpError.error.message != null) ? httpError.error.message : error.message;
            console.log("Error during logout : " + errorMessage);
          } else {
            console.log('Error (non-HTTP) during logout');
          }
          throw error;
        })
      ).subscribe();
    }
  }
  
  refreshTokenObservable(token: string): Observable<{user: User, accessToken: string, refreshToken: string}> {
    return this._http.post<{user: User, accessToken: string, refreshToken: string}>(`${environment.apiUrl}/auth/refresh`, {refreshToken: token}).pipe(
      tap(refreshResponse => {
        this.setUser(refreshResponse.user);
        this.setAccessToken(refreshResponse.accessToken);
        this.setRefreshToken(refreshResponse.refreshToken);
      }),
      catchError(error => {        
        this.resetAuthInfos();
        if (error instanceof HttpErrorResponse) {
          const httpError = error.error;
          const errorMessage = (httpError != null && httpError.error != null && httpError.error.message != null) ? httpError.error.message : error.message;
          console.log("Error during refresh : " + errorMessage);
        } else {
          console.log('Error (non-HTTP) during refresh');
        }
        throw error;
      })
    );
  }

  // Getter / Setters

  retrieveUser(): void {
    this.setUser(this.getUser());
  }

  getUser(): User | null {
    const userString = window.localStorage.getItem("user");
    return userString ? JSON.parse(userString) as User : null;
  }

  private setUser(user: User | null): void {
    this._userSubject.next(user);
    if (user) {
      if (user.id === undefined) {
        console.error(new Error("Error when setting user : no id field in the object (required !)"));
        this.resetAuthInfos();
        return;
      }
      this._userId = user.id;
      this._isUserAdmin = user.role === Role.Admin;
      window.localStorage.setItem("user", JSON.stringify(user));
    } else {
      this._isUserAdmin = false;
      this._userId = null;
      window.localStorage.removeItem("user");
    }
  }
  
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }
  
  private setAccessToken(token: string): void {
    window.localStorage.setItem("accessToken", token);
  }
  
  deleteAccessToken(): void {
    window.localStorage.removeItem("accessToken");
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }
  
  private setRefreshToken(token: string): void {
    window.localStorage.setItem("refreshToken", token);
  }

  get userSubject(): ReplaySubject<User | null> {
    return this._userSubject;
  }

  // Other methods

  private resetAuthInfos(): void {
    this.setUser(null);
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
  }

  isUserAuthor(authorId: string): boolean {
    return authorId === this._userId;
  }

  containsCurrentUser(userArray: {id: string}[]): boolean {
    for (let user of userArray) {
      if (user.id === this._userId) return true;
    }
    return false;
  }

  canEditAndDeletePost(postAuthorId: string): boolean {
    return this._isUserAdmin || this.isUserAuthor(postAuthorId)
  }

  redirectToLogin(): void {
    this._redirectedToLogin = true;
    this.router.navigate(['login']);
  }

  redirectTo404(): void {
    this.router.navigate(['404'], {skipLocationChange:true});
  }
}