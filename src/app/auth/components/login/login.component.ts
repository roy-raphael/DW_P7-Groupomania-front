import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, take, tap } from 'rxjs';
import { User } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';

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

  error!: string | null;
  
  constructor(private authService: AuthService,
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
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.error = "Wrong email / password";
          console.log("Wrong email / password");
        } else {
          console.log('Caught in login CatchError. Throwing error');
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
