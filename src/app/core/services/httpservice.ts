// core/services/http.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class HttpService {
  private baseUrl = 'https://panel.deyvid.dev/api';

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, options?: { headers?: HttpHeaders; params?: HttpParams; withCredentials?: boolean }) {
  return this.http.get<T>(this.baseUrl + endpoint, {
    ...options,
    withCredentials: options?.withCredentials ?? false
  });
}

  post<T>(endpoint: string, body: any, options?: { headers?: HttpHeaders; params?: HttpParams }) {
    return this.http.post<T>(this.baseUrl + endpoint, body, options);
  }

  put<T>(endpoint: string, body: any, options?: { headers?: HttpHeaders; params?: HttpParams }) {
    return this.http.put<T>(this.baseUrl + endpoint, body, options);
  }

  delete<T>(endpoint: string, options?: { headers?: HttpHeaders; params?: HttpParams }) {
    return this.http.delete<T>(this.baseUrl + endpoint, options);
  }
}
