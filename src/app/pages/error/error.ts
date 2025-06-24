import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppConfigurator } from '../../shared/navigation/parts/app.configurator';

@Component({
  selector: 'app-error-page',
  templateUrl: './error.html',
  imports: [ButtonModule, RouterModule, AppConfigurator],
})
export class ErrorComponent implements OnInit {
  message: string = 'An unexpected error occurred.';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const msg = this.route.snapshot.queryParamMap.get('message');
    if (msg) this.message = decodeURIComponent(msg);
    history.replaceState({}, '', this.route.snapshot.routeConfig?.path ?? '/');
  }
}
