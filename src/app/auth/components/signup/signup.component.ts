import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, map, Observable, tap } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { confirmEqualValidator } from '../../validators/confirm-equal.validator';
import { patternValidator } from '../../validators/pattern.validator';

const PASSWORD_MIN_LENGTH : number = 8;
const PASSWORD_MAX_LENGTH : number = 100;
const PASSWORD_MIN_LOWERCASE_LETTERS : number = 2;
const PASSWORD_MIN_UPPERCASE_LETTERS : number = 2;
const PASSWORD_MIN_NUMBERS : number = 2;
const PASSWORD_MIN_SPECIAL_CHARACTERS : number = 2;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  loading = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  mainForm!: FormGroup;
  firstNameCtrl!: FormControl;
  lastNameCtrl!: FormControl;
  usernameCtrl!: FormControl;
  personalInfoForm!: FormGroup;
  contactPreferenceCtrl!: FormControl;
  emailCtrl!: FormControl;
  confirmEmailCtrl!: FormControl;
  emailForm!: FormGroup;
  phoneCtrl!: FormControl;
  passwordCtrl!: FormControl;
  confirmPasswordCtrl!: FormControl;
  loginInfoForm!: FormGroup;

  showEmailError$!: Observable<boolean>;
  showPasswordError$!: Observable<boolean>;

  error!: string | null;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.initFormControls();
    this.initMainForm();
    this.initFormObservables();
  }

  private initMainForm(): void {
    this.mainForm = this.formBuilder.group({
      personalInfo: this.personalInfoForm,
      email: this.emailForm,
      loginInfo: this.loginInfoForm
    });
  }

  private initFormControls(): void {
    this.firstNameCtrl = this.formBuilder.control('', Validators.required);
    this.lastNameCtrl = this.formBuilder.control('', Validators.required);
    this.usernameCtrl = this.formBuilder.control('');
    this.personalInfoForm = this.formBuilder.group({
      firstName: this.firstNameCtrl,
      lastName: this.lastNameCtrl,
      username: this.usernameCtrl
    });
    this.emailCtrl = this.formBuilder.control('', [Validators.required, Validators.email,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]);
    this.confirmEmailCtrl = this.formBuilder.control('', [Validators.required, Validators.email]);
    this.emailForm = this.formBuilder.group({
      email: this.emailCtrl,
      confirm: this.confirmEmailCtrl
    }, {
      validators: [confirmEqualValidator('email', 'confirm')],
      updateOn: 'blur'
    });
    this.passwordCtrl = this.formBuilder.control('', [    
         // 1. Password Field is Required
         Validators.required,
         // 2. Has a minimum length
         Validators.minLength(PASSWORD_MIN_LENGTH),
         // 3. Has a maximum length
         Validators.maxLength(PASSWORD_MAX_LENGTH),
         // 4. check whether the entered password has enough lower-case letters
         patternValidator(/[a-z]/g, PASSWORD_MIN_LOWERCASE_LETTERS, { hasSmallCase: true }),
         // 5. check whether the entered password has enough upper-case letters
         patternValidator(/[A-Z]/g, PASSWORD_MIN_UPPERCASE_LETTERS, { hasCapitalCase: true }),
         // 6. check whether the entered password has enough numbers
         patternValidator(/\d/g, PASSWORD_MIN_NUMBERS, { hasNumber: true }),
         // 7. check whether the entered password has enough special characters
         patternValidator(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g, PASSWORD_MIN_SPECIAL_CHARACTERS, { hasSpecialCharacters: true })]);
    this.confirmPasswordCtrl = this.formBuilder.control('', Validators.required);
    this.loginInfoForm = this.formBuilder.group({
      password: this.passwordCtrl,
      confirmPassword: this.confirmPasswordCtrl
    }, {
      validators: [confirmEqualValidator('password', 'confirmPassword')],
      updateOn: 'blur'
    });
  }
  
  private initFormObservables() {
    this.showEmailError$ = this.emailForm.statusChanges.pipe(
      map(status => status === 'INVALID' &&
                    this.emailCtrl.value &&
                    this.confirmEmailCtrl.value &&
                    this.emailForm.hasError('confirmEqual')
      )
    );
    this.showPasswordError$ = this.loginInfoForm.statusChanges.pipe(
      map(status => status === 'INVALID' &&
                    this.passwordCtrl.value &&
                    this.confirmPasswordCtrl.value &&
                    this.loginInfoForm.hasError('confirmEqual')
      )
    );
  }

  onSubmitForm() {
    this.loading = true;
    this.authService.signup(this.emailCtrl.value, this.passwordCtrl.value, this.firstNameCtrl.value, this.lastNameCtrl.value, this.usernameCtrl.value).pipe(
      tap((response: {message: string}) => {
        this.loading = false;
        if (response) {
          this.resetForm();
          this.authService.redirectToLogin();
        }
      }),
      catchError(error => {
        this.loading = false;
        if (error instanceof HttpErrorResponse) {
          if (error.status === 400) {
            this.error = "Erreur dans la requête HTTP envoyée";
          } else {
            this.error = "Erreur du serveur";
          }
        } else {
          this.error = "Erreur interne";
        }
        throw error;
      })
    ).subscribe();
  }

  private resetForm() {
    this.mainForm.reset();
  }
  
  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  public toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  getFormControlErrorText(ctrl: AbstractControl) {
    if (ctrl.hasError('required')) {
      return 'Ce champ est requis';
    } else if (ctrl.hasError('email')) {
      return 'Merci d\'entrer une adresse mail valide';
    } else if (ctrl.hasError('pattern')) {
      return 'Merci d\'entrer une adresse mail valide';
    } else if (ctrl.hasError('minlength')) {
      return `Ce mot de passe ne contient pas assez de caractères (min. ${PASSWORD_MIN_LENGTH})`;
    } else if (ctrl.hasError('maxlength')) {
      return `Ce mot de passe contient trop de caractères (max. ${PASSWORD_MAX_LENGTH})`;
    } else if (ctrl.hasError('hasSmallCase')) {
      return `Ce mot de passe ne contient pas assez de lettres minuscules (min. ${PASSWORD_MIN_LOWERCASE_LETTERS})`;
    } else if (ctrl.hasError('hasCapitalCase')) {
      return `Ce mot de passe ne contient pas assez de lettres majuscules (min. ${PASSWORD_MIN_UPPERCASE_LETTERS})`;
    } else if (ctrl.hasError('hasNumber')) {
      return `Ce mot de passe ne contient pas assez de chiffres (min. ${PASSWORD_MIN_NUMBERS})`;
    } else if (ctrl.hasError('hasSpecialCharacters')) {
      return `Ce mot de passe ne contient pas assez de caractères spéciaux (min. ${PASSWORD_MIN_SPECIAL_CHARACTERS})`;
    } else {
      return 'Ce champ contient une erreur';
    }
  }
}
