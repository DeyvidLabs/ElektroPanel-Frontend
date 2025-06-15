// src/app/services/proxmox.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiConfigService } from '../../shared/api-config';

@Injectable({
  providedIn: 'root',
})
export class ProxmoxService {

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getNodes(): Observable<any> {
    return this.http.get(`${this.apiConfig.getApiUrl()}/proxmox/nodes`);
  }

  getNodeInfo(nodeName: string): Observable<any> {
    return this.http.get(`${this.apiConfig.getApiUrl()}/proxmox/nodes/${nodeName}`);
  }

  getVMs(nodeName: string): Observable<any> {
    return this.http.get(`${this.apiConfig.getApiUrl()}/proxmox/nodes/${nodeName}/vms`);
  }

  getVMStatus(nodeName: string, vmid: number): Observable<any> {
    return this.http.get(`${this.apiConfig.getApiUrl()}/proxmox/nodes/${nodeName}/vms/${vmid}/status`);
  }

  getVMConfig(nodeName: string, vmid: number): Observable<any> {
    return this.http.get(`${this.apiConfig.getApiUrl()}/proxmox/nodes/${nodeName}/vms/${vmid}/config`);
  }

  startVM(nodeName: string, vmid: number): Observable<any> {
    return this.http.post(`${this.apiConfig.getApiUrl()}/proxmox/nodes/${nodeName}/vms/${vmid}/start`, {});
  }

  stopVM(nodeName: string, vmid: number): Observable<any> {
    return this.http.post(`${this.apiConfig.getApiUrl()}/proxmox/nodes/${nodeName}/vms/${vmid}/stop`, {});
  }

  shutdownVM(nodeName: string, vmid: number): Observable<any> {
    return this.http.post(`${this.apiConfig.getApiUrl()}/proxmox/nodes/${nodeName}/vms/${vmid}/shutdown`, {});
  }

  getVMStorage(nodeName: string, vmid: number): Observable<any> {
    return this.http.get(`${this.apiConfig.getApiUrl()}/proxmox/nodes/${nodeName}/vms/${vmid}/storage`)
      .pipe(
        map(response => response),
        catchError(error => {
          //console.error('Full error details:', error); // Log the entire error object
          return throwError(error);
        })
      );
  }
}
