import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, take, tap } from 'rxjs';
import { User } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageHandlingService } from 'src/app/core/services/message-handling.service';

const EMAIL_REGEXP = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const TIME_DIFFS = {
  minute: 60,
  hour: 60 * 60,
  day: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  month: 30 * 24 * 60 * 60,
  year: 365 * 24 * 60 * 60
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  mainForm!: FormGroup;
  emailCtrl!: FormControl;
  passwordCtrl!: FormControl;
  loading = false;
  showPassword: boolean = false;
  
  constructor(private authService: AuthService,
              private messagehandlingService: MessageHandlingService,
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initMainForm();
  }

  private initMainForm(): void {
    this.emailCtrl = this.formBuilder.control('', [Validators.required, Validators.email, Validators.pattern(EMAIL_REGEXP)]);
    this.passwordCtrl = this.formBuilder.control('', Validators.required);
    this.mainForm = this.formBuilder.group({
      email: this.emailCtrl,
      password: this.passwordCtrl
    });
  }

  onSubmitForm() {
    if (!this.mainForm.valid) {
      this.mainForm.markAllAsTouched();
      this.messagehandlingService.displayError("Erreur lors de la tentative de connexion : les champs ne sont pas tous valides. Veuillez corriger le(s) champ(s) erroné(s).");
      return;
    }
    this.loading = true;
    this.authService.login(this.emailCtrl.value, this.passwordCtrl.value).pipe(
      take(1),
      tap((response: {user: User, accessToken: string, refreshToken: string}) => {
        this.loading = false;
        if (response) {
          this.mainForm.reset();
        }
      }),
      catchError(error => {
        this.loading = false;
        this.displayLoginError(error);
        throw error;
      })
    ).subscribe();
  }
  
  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private displayLoginError(error: any) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 429) {
        var retryAfterSec = error.error ? error.error.retryAfter : 0;
        if (retryAfterSec) {
          var retryAfterString = `${retryAfterSec} secondes`;
          if (retryAfterSec === 1) {
            retryAfterString = `1 seconde`;
          } else if (retryAfterSec < TIME_DIFFS.minute) {
            retryAfterString = `${retryAfterSec} secondes`;
          } else if (retryAfterSec < 2 * TIME_DIFFS.minute) {
            retryAfterString = `1 minute`;
          } else if (retryAfterSec < TIME_DIFFS.hour) {
            retryAfterString = `${Math.floor(retryAfterSec / TIME_DIFFS.minute)} minutes`;
          } else if (retryAfterSec < 2 * TIME_DIFFS.hour) {
            retryAfterString = `1 heure`;
          } else if (retryAfterSec < 2 * TIME_DIFFS.day) {
            retryAfterString = `${Math.floor(retryAfterSec / TIME_DIFFS.hour)} heures`;
          } else if (retryAfterSec < 2 * TIME_DIFFS.week) {
            retryAfterString = `${Math.floor(retryAfterSec / TIME_DIFFS.day)} jours`;
          } else if (retryAfterSec < 2 * TIME_DIFFS.month) {
            retryAfterString = `${Math.floor(retryAfterSec / TIME_DIFFS.week)} semaines`;
          } else if (retryAfterSec < 2 * TIME_DIFFS.year) {
            retryAfterString = `${Math.floor(retryAfterSec / TIME_DIFFS.month)} mois`;
          } else {
            retryAfterString = `${Math.floor(retryAfterSec / TIME_DIFFS.year)} ans`;
          }
          if (error.status === 401) {
            this.messagehandlingService.displayError("Erreur : mot de passe invalide. Veuillez réessayer dans " + retryAfterString);
          } else {
            this.messagehandlingService.displayError("Erreur : trop de tentatives de connexion échouées (mot de passe invalide). Veuillez réessayer dans " + retryAfterString);
          }
        } else {
          if (error.status === 401) {
            this.messagehandlingService.displayError("Erreur : utilisateur inconnu ou mot de passe invalide.");
          } else {
            this.messagehandlingService.displayError("Erreur : trop de tentatives de connexion échouées (mot de passe invalide). Veuillez attendre avant de réessayer.");
          }
        }
      } else {
        this.messagehandlingService.displayError("Erreur du serveur. Veuillez réessayer plus tard.");
      }
    } else {
      this.messagehandlingService.displayError("Erreur pendant la connexion. Veuillez réessayer plus tard.");
    }
  }
  
  getFormControlErrorText(ctrl: AbstractControl) {
    if (ctrl.hasError('required')) {
    return 'Ce champ est requis';
    } else if (ctrl.hasError('email')) {
      return 'Merci d\'entrer une adresse mail valide';
    } else {
      return 'Ce champ contient une erreur';
    }
  }
}
