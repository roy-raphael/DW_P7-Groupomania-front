import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MessageHandlingService {  
  constructor(private _snackBar: MatSnackBar) {}
  
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