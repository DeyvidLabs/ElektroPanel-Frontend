import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './httpservice';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private httpService: HttpService) {}

  isAuthenticated(): Observable<boolean> {
    return this.httpService.get<{ success: boolean }>('/auth/validate', {
    }).pipe(
      map(res => res.success === true),
      catchError(err => {
        console.error('Token validation failed:', err);
        return of(false);
      })
    );
  }

  // auth.service.ts
  logout(): Observable<any> {
    return this.httpService.post('/auth/logout', {});
  }
}
