// pages/home/home.ts
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastService } from '../../shared/toasts';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.html',
})
export class Home {

  message: string = 'You got redirected';

  constructor(private route: ActivatedRoute, private toastService: ToastService) {}

  ngOnInit() {
    const msg = this.route.snapshot.queryParamMap.get('message');
    const error = this.route.snapshot.queryParamMap.get('error');
    if (msg) { 
      this.message = decodeURIComponent(msg);
      this.toastService.success("Success!", this.message, 10000);
    }
    if(error) {
      this.message = decodeURIComponent(error);
      this.toastService.error("Error!", this.message, 10000);
    }
    history.replaceState({}, '', this.route.snapshot.routeConfig?.path ?? '/');
  }
}