import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}
  
  login(email: string, password: string) {
    const body: {email: string, password: string} = {email, password};
    this.http.post<{userId: string, token: string}>(`${environment.apiUrl}/auth/login`, body).pipe(
      take(1),
      tap(loginResponse => {
        localStorage.setItem("jwt", loginResponse.token);
        localStorage.setItem("userId", loginResponse.userId);
      }),
      catchError(error => {
        this.resetToken();
        console.log('Caught in CatchError. Throwing error');
        throw new Error(error);
      })
    ).subscribe();
  }
  
  getToken(): string | null {
    return localStorage.getItem("jwt");
  }
  
  getUserId(): string | null {
    return localStorage.getItem("userId");
  }
  
  resetToken() {
    localStorage.removeItem("jwt");
  }
}