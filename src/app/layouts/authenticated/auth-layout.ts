import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navigation } from '../../shared/navigation/navigation';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, Navigation],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css'
})
export class AuthLayout {

}
