// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from '../services/user';
import { UserDto } from '../../shared/dto/user.dto';

export const adminGuard: CanActivateFn = (route, state) => {
  const user = inject(UserService);
  const router = inject(Router);

  return user.getUserInfo().pipe(
    map((userInfo: UserDto) => {
      return userInfo.permissions.some(p => p.name = "ADMIN") ? true : router.createUrlTree(['/dashboard']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/dashboard']));
    })
  );
};
