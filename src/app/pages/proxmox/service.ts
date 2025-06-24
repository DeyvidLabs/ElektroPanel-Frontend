import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/httpservice';

@Injectable({
  providedIn: 'root',
})
export class ProxmoxService {
  constructor(private http: HttpService) {}

  getNodes(): Observable<any> {
    return this.http.get('/proxmox/nodes');
  }

  getNodeInfo(nodeName: string): Observable<any> {
    return this.http.get(`/proxmox/nodes/${nodeName}`);
  }

  getVMs(nodeName: string): Observable<any> {
    return this.http.get(`/proxmox/nodes/${nodeName}/vms`);
  }

  getVMStatus(nodeName: string, vmid: number): Observable<any> {
    return this.http.get(`/proxmox/nodes/${nodeName}/vms/${vmid}/status`);
  }

  getVMConfig(nodeName: string, vmid: number): Observable<any> {
    return this.http.get(`/proxmox/nodes/${nodeName}/vms/${vmid}/config`);
  }

  startVM(nodeName: string, vmid: number): Observable<any> {
    return this.http.post(`/proxmox/nodes/${nodeName}/vms/${vmid}/start`, {});
  }

  stopVM(nodeName: string, vmid: number): Observable<any> {
    return this.http.post(`/proxmox/nodes/${nodeName}/vms/${vmid}/stop`, {});
  }

  shutdownVM(nodeName: string, vmid: number): Observable<any> {
    return this.http.post(`/proxmox/nodes/${nodeName}/vms/${vmid}/shutdown`, {});
  }

  getVMStorage(nodeName: string, vmid: number): Observable<any> {
    return this.http.get(`/proxmox/nodes/${nodeName}/vms/${vmid}/storage`);
  }
}
