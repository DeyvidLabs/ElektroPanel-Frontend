import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './httpservice';
// import jwtDecode from "jwt-decode"; // <-- default import

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpService) {}

  getUserInfo(): Observable<any> {
    return this.http.get('/users/me');
  }

  getAllUsers(): Observable<any> {
    return this.http.get('/users/getAll');
  }

  getPermissions(): Observable<any> {
    return this.http.get('/permission');
  }

  checkEmailExists(email: string): Observable<any> {
    return this.http.post('/users/emailExists', { email: email });
  }

  toggleStatus(userId: string, status: boolean): Observable<any> {
    return this.http.patch(`/users/${userId}/toggle-status`, { enabled: status });
  }

  updateUserPermissions(userId: string, permissionIds: string[]): Observable<any> {
    return this.http.patch(`/users/${userId}/permissions`, {
      permissions: permissionIds
    });
  }

  createUserPermission(name: string, description: string): Observable<any> {
    return this.http.post(`/permission`, {
      name: name,
      description: description
    });
  }

  deleteAccount(deletePassword: string): Observable<any> {
    return this.http.delete('/users/delete-email', {
      body: { password: deletePassword }
    })
  }  

  adminDeleteUser(email: string): Observable<any> {
    return this.http.delete('/users/delete', {
      body: { email: email }
    })
  }  

  updateDisplayName(displayName: string): Observable<any> {
   return this.http.patch('/users/display-name', { displayName: displayName });
  }
  
  updateEmail(newEmail: string): Observable<any> {
    return this.http.post('/users/email', { newEmail: newEmail });
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.patch('/users/password', {
      currentPassword: currentPassword,
      newPassword: newPassword
    });
  }
}
