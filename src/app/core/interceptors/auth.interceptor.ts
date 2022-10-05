import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError  } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private accessToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let modifiedReq = req;
    // console.log(modifiedReq.url);

    if (modifiedReq.url === `${environment.apiUrl}/auth/signup` || modifiedReq.url === `${environment.apiUrl}/auth/login` || modifiedReq.url === `${environment.apiUrl}/auth/logout` || modifiedReq.url === `${environment.apiUrl}/auth/refresh`) {
      // Auth routes
      const token = this.authService.getRefreshToken();
      if (token === null) {
        // No need of a refresh token for signup, login and logout routes : only refresh route
        // if (modifiedReq.url.includes('auth/refresh')) {
        if (modifiedReq.url === `${environment.apiUrl}/auth/refresh`) {
          this.authService.redirectToLogin();
          // TODO return error or not ?
          return throwError(() => new Error ("No refresh token when requesting URL " + modifiedReq.url));
        }
      } else {
        modifiedReq = this.addTokenHeader(req, token);
      }
    } else {
      // Not Auth routes
      const token = this.authService.getAccessToken();
      if (token === null) {
        return this.refreshAndHandle(modifiedReq, next);
      } else {
        modifiedReq = this.addTokenHeader(req, token);
      }
    }

    return next.handle(modifiedReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.refreshAndHandle(modifiedReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private refreshAndHandle(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.accessToken$.next(null);

      const token = this.authService.getRefreshToken();

      if (token) {
        return this.authService.refreshTokenObservable().pipe(
          switchMap((token: any) => {
            this.isRefreshing = false;

            this.authService.setAccessToken(token.accessToken);
            this.authService.setRefreshToken(token.refreshToken);
            this.accessToken$.next(token.accessToken);
            
            return next.handle(this.addTokenHeader(request, token.accessToken));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            
            this.authService.logOut();
            return throwError(() => err);
          })
        );
      } else {
        this.authService.redirectToLogin();
        return throwError(() => new Error ("No refresh token when requesting URL " + request.url));
      }
    }

    return this.accessToken$.pipe(
      filter(accessToken => accessToken !== null),
      take(1),
      switchMap((accessToken) => next.handle(this.addTokenHeader(request, accessToken)))
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
  }
}
