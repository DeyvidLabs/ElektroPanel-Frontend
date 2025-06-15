import { Component } from '@angular/core';
@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {


  redirectToGoogleAuth(){
    window.location.href = `https://panel.deyvid.dev/api/auth/google/callback`;
  }
}
