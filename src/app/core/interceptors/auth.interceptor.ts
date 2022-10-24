import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError  } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { MessageHandlingService } from '../services/message-handling.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private accessToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService,
              private messagehandlingService: MessageHandlingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    if (token === null) {
      return this.refreshAndHandle(req, next);
    } else {
      const modifiedReq = this.addTokenHeader(req, token);
      return next.handle(modifiedReq).pipe(
        catchError(error => {
          this.messagehandlingService.logError(error, "AuthInterceptor:intercept", modifiedReq.url);
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              this.authService.deleteAccessToken();
              return this.refreshAndHandle(modifiedReq, next);
            } else if (error.status === 404) {
              this.authService.redirectTo404();
            }
          }
          return throwError(() => error);
        })
      );
    }
  }

  private refreshAndHandle(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.accessToken$.next(null);

      const token = this.authService.getRefreshToken();

      if (token) {
        return this.authService.refreshTokenObservable(token).pipe(
          switchMap((refreshResponse: {user: User, accessToken: string, refreshToken: string}) => {
            this.isRefreshing = false;
            this.accessToken$.next(refreshResponse.accessToken);
            return next.handle(this.addTokenHeader(request, refreshResponse.accessToken));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.messagehandlingService.logError(error, "AuthInterceptor:refreshAndHandle", request.url);
            console.log("User disconnected");
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

  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
  }
}
