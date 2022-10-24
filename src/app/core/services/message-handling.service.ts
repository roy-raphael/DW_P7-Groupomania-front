import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MessageHandlingService {  
  constructor(private _snackBar: MatSnackBar) {}

  logError(error: any, originFunctionName: string, requestUrl?: string): void {
    if (error != null) {
      if (error instanceof HttpErrorResponse) {
        const httpError = error.error;
        if (httpError != null && httpError.error != null && httpError.error.message != null) {
          console.log(`Error HTTP ${error.status} from server during ${originFunctionName}${requestUrl ? " (for URL " + requestUrl + ")" : ""} : ${httpError.error.message}`);
        } else {
          console.log(`Error HTTP ${error.status} during ${originFunctionName}${requestUrl ? " (for URL " + requestUrl + ")" : ""} : ${error.message}`);
        }
      } else {
        console.log(`Error (non-HTTP) during ${originFunctionName} : ${error.message}`);
      }
    }
  }
  
  displaySuccess(message: string): void {
    this._snackBar.open(message, "fermer", {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      politeness: 'polite',
      panelClass: ['success-snack-bar'],
      duration: 5 * 1000 // disappear after 5 seconds
    });
  }
  
  displayError(message: string): void {
    this._snackBar.open(message, "fermer", {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      politeness: 'assertive',
      panelClass: ['error-snack-bar'],
      duration: 30 * 1000 // disappear after 30 seconds
    });
  }
}