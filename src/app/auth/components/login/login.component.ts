import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, take, tap } from 'rxjs';
import { User } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageHandlingService } from 'src/app/core/services/message-handling.service';

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
  
  constructor(private authService: AuthService,
              private messagehandlingService: MessageHandlingService,
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initMainForm();
  }

  private initMainForm(): void {
    this.emailCtrl = this.formBuilder.control('', [Validators.required, Validators.email]);
    this.passwordCtrl = this.formBuilder.control('', Validators.required);
    this.mainForm = this.formBuilder.group({
      email: this.emailCtrl,
      password: this.passwordCtrl
    });
  }

  onSubmitForm() {
    this.loading = true;
    this.authService.login(this.emailCtrl.value, this.passwordCtrl.value).pipe(
      take(1),
      tap((response: {user: User, accessToken: string, refreshToken: string}) => {
        this.loading = false;
        if (response) {
          this.resetForm();
        }
      }),
      catchError(error => {
        this.loading = false;
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            this.messagehandlingService.displayError("Erreur : utilisateur inconnu ou mot de passe invalide.");
          } else if (error.status === 429) {
            this.messagehandlingService.displayError("Erreur : mot de passe invalide. Veuillez attendre avant de réessayer."); // TODO retrieve retry-after
          } else {
            this.messagehandlingService.displayError("Erreur du serveur. Veuillez réessayer plus tard.");
          }
        } else {
          this.messagehandlingService.displayError("Erreur pendant la connexion. Veuillez réessayer plus tard.");
        }
        throw error;
      })
    ).subscribe();
  }

  private resetForm() {
    this.mainForm.reset();
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
