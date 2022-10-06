import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError  } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private accessToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // console.log(req.url);
    if (req.url === `${environment.apiUrl}/auth/signup` || req.url === `${environment.apiUrl}/auth/login` || req.url === `${environment.apiUrl}/auth/logout` || req.url === `${environment.apiUrl}/auth/refresh`) {
      // For auth routes : we don't want to add a token as authorization header, and we don't want to call the refresh route if this route fails 
      return next.handle(req);
    }

    // Not Auth routes
    const token = this.authService.getAccessToken();
    if (token === null) {
      console.log("Token null : call refreshAndHandle");
      return this.refreshAndHandle(req, next);
    } else {
      const modifiedReq = this.addTokenHeader(req, token);
      return next.handle(modifiedReq).pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.logRequestError(<HttpErrorResponse>error, modifiedReq.url);
            return this.refreshAndHandle(modifiedReq, next);
          }
          return throwError(() => error);
        })
      );
    }
  }

  private refreshAndHandle(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.accessToken$.next(null);

      const token = this.authService.getRefreshToken();

      if (token) {
        return this.authService.refreshTokenObservable(token).pipe(
          switchMap((token: any) => {
            this.isRefreshing = false;

            this.authService.setAccessToken(token.accessToken);
            this.authService.setRefreshToken(token.refreshToken);
            this.accessToken$.next(token.accessToken);
            
            return next.handle(this.addTokenHeader(request, token.accessToken));
          }),
          catchError((error) => {
            this.isRefreshing = false;

            if (error instanceof HttpErrorResponse) this.logRequestError(<HttpErrorResponse>error, request.url);
            else console.log("Error when refreshing : " + error.message);
            console.log("Disconnecting the user");
            
            this.authService.logOut();
            this.authService.redirectToLogin();
            return throwError(() => error);
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

  private logRequestError(error: HttpErrorResponse, requestUrl: string): void {
    const httpError = error.error;
    if (httpError === null || httpError === undefined) {
      console.log("HTTP error (for URL " + requestUrl + ") : " + error.message);
    } else {
      const backendError = httpError.error;
      if (backendError === null || backendError === undefined) {
        console.log("HTTP error (for URL " + requestUrl + ") : " + error.message);
      } else {
        console.log("HTTP error from backend (for URL " + requestUrl + ") : " + backendError.message);
      }
    }
  }
}
