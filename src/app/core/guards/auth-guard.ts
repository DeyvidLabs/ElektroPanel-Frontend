// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated().pipe(
    map((isAuth) => {
      return isAuth ? true : router.createUrlTree(['/auth']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/auth']));
    })
  );
};
