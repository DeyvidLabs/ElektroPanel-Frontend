import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AppConfigurator } from '../../shared/navigation/parts/app.configurator';
import { HttpService } from '../../core/services/httpservice';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ReactiveFormsModule,
    AppConfigurator,
    InputTextModule,
    PasswordModule
  ]
})
export class AuthComponent {
  authMode: 'login' | 'register' = 'login';
  showPrivacy = false;
  form: FormGroup;
  authError: string | null = null;


  constructor(private fb: FormBuilder, private httpService: HttpService, private router: Router) {
    this.form = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });

    this.updateForm();
  }

  updateForm() {
    if (this.authMode === 'login') {
      this.form.removeControl('confirmPassword');
      this.form.clearValidators();
    } else {
      this.form.addControl('confirmPassword', this.fb.control('', Validators.required));
      this.form.setValidators([this.passwordMatchValidator]);
    }

    this.form.updateValueAndValidity(); // Force validation re-check
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  }

  toggleMode() {
    this.authMode = this.authMode === 'login' ? 'register' : 'login';
    this.form.reset();
    this.updateForm();
    this.authError = null;

  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const { email, password, name } = this.form.value;

    if (this.authMode === 'login') {
      this.httpService.post('/auth/login', { email, password }).subscribe({
        next: (data: any) => {
          if(data && data.message){
            this.authError = null;
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          console.error('Login failed', err)
          this.authError = 'Invalid email or password.';
        }
      });
    } else {
      this.httpService.post('/auth/register', { name, email, password }).subscribe({
        next: (data: any) => {
          if(data && data.message){
            this.authError = null;
            this.router.navigate(['/'], {
              queryParams: { message: data.message }
            });         
          }
        },
        error: (err) => {
          console.error('Registration failed', err)
          this.authError = 'Invalid email or password.';
        }
      });
    }
  }

  redirectToGoogleAuth() {
    window.location.href = `https://panel.deyvid.dev/api/auth/google/callback`;
  }
}
