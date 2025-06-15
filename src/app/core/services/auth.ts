import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './httpservice';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private httpService: HttpService) {}

  isAuthenticated(): Observable<boolean> {
    return this.httpService.get<{ success: boolean }>('/auth/validate', {
      withCredentials: true,
    }).pipe(
      map(res => res.success === true),
      catchError(err => {
        console.error('Token validation failed:', err);
        return of(false);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    document.cookie = 'access_token=; Max-Age=0; path=/;';
    document.cookie = 'refresh_token=; Max-Age=0; path=/;';
  }
}
