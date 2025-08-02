import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './httpservice';
// import jwtDecode from "jwt-decode"; // <-- default import

@Injectable({ providedIn: 'root' })
export class LoggingService {
  constructor(private http: HttpService) {}

  getLogs(): Observable<any> {
    return this.http.get('/logging');
  }
}
