import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpService } from '../../core/services/httpservice';
import { IBlacklistIPInfo, IEmailHistory, IEmailUser } from '../../shared/interfaces/email.interfaces';
import { HttpParams } from '@angular/common/http';



@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor(private http: HttpService) {}

  getEmailHistory(): Observable<IEmailHistory> {
    return this.http.get('/email/history');
  }

  getMaliciousIPs(): Observable<IBlacklistIPInfo[]> {
    return this.http.get<IBlacklistIPInfo[]>('/email/malicious').pipe(
      map(ips => ips.map(ip => ({
        ...ip,
        lastSeen: new Date(ip.lastSeen) // Ensure date is properly parsed
      }))));
  }

  getAllUsers(): Observable<IEmailUser[]> {
    return this.http.get(`/email/users`);
  }

  blacklistIPAddress(ip: string): Observable<{ message: string }> {
    const params = new HttpParams().set('ip', ip);
    return this.http.post<{ message: string }>('/email/blacklist', null, { params });
  }

  unblacklistIPAddress(ip: string): Observable<{ message: string }> {
    const params = new HttpParams().set('ip', ip);
    return this.http.delete<{ message: string }>('/email/blacklist', null, { params });
  }
}
