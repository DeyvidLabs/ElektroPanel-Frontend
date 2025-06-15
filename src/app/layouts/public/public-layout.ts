// layouts/public/public-layout.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './public-layout.html',
})
export class PublicLayout {}