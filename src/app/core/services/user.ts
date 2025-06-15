import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  uploadAvatar(formData: FormData): Observable<any> {
    return this.http.post('/api/users/upload-avatar', formData, { withCredentials: true });
  }

  getAvatar(userId?: number): Observable<Blob> {
    return this.http.get(`/api/users/${userId}/avatar`, {
      responseType: 'blob',
      withCredentials: true
    });
  }
}
