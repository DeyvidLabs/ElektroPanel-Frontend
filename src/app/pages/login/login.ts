import { Component } from '@angular/core';
import { HttpService } from '../../core/services/httpservice';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  password: string = '';
  email: string = '';

  constructor(private httpService: HttpService, private router: Router) {}

  redirectToGoogleAuth(){
    window.location.href = `https://panel.deyvid.dev/api/auth/google/callback`;
  }
  login(){
    this.httpService.post('/auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (data: any) => {
        if(data && data.success) {
          // Handle successful login, e.g., redirect to dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => console.error('Login failed', err)
    });
  }
}
