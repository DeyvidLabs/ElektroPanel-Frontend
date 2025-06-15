// pages/home/home.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProxmoxService } from './service';
import { ToastService } from '../../shared/toasts';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-proxmox',
  standalone: true,
  imports: [RouterModule, CommonModule, ProgressBarModule, CardModule, DialogModule, TagModule, ButtonModule, ToastModule],
  templateUrl: './proxmox.html',
  styleUrls: ['./proxmox.css']
})
export class Proxmox {

  nodes: any[] = [];
  vms: { [key: string]: any } = {};
  vmStatus: any = null;
  vmConfig: any = null;
  nodeInfo: { [key: string]: any } = {};
  vmStorage: { [key: string]: any } = {};
  nodeInfoDelay: any;
  vmInfoDelay: { [key: string]: any } = {};
  isCollapsed: { [key: string]: boolean } = {};
  isUpdating: { [key: string]: boolean } = {};
  userPermissions: string[] = [];
  vmDialogVisible: boolean = false;
  selectedNode: string = ''; // Variable to store the selected node for the modal
  selectedVMs: any[] = []; // Store selected VMs for modal
  selectedVM: any = null; // Store selected VM for actions like start, stop, restart, etc.

  delayUpdateInfo: number = 30000;
  delayUpdateVMs: number = 10000;
  delayRefresh: number = 7500;
  
  constructor(private proxmoxService: ProxmoxService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.fetchNodes();
    this.startUpdatingNodeInfo();
    this.loadPermissions();
  }

  ngOnDestroy(): void {
    clearInterval(this.nodeInfoDelay);
    Object.values(this.vmInfoDelay).forEach(clearInterval); // Clear all intervals on component destroy
  }

  // Show modal with VM details
  showVMModal(nodeName: string) {
    this.selectedNode = nodeName;
    this.fetchVMs(nodeName);
    this.vmDialogVisible = true;
  }

  // Close VM Modal
  hideVMModal() {
    this.vmDialogVisible = false;
    this.selectedVM = null;
  }

  // Fetch VMs of a node
  fetchVMs(nodeName: string) {
    this.proxmoxService.getVMs(nodeName).subscribe((data) => {
      this.vms[nodeName] = data.sort((a: any, b: any) => a.vmid - b.vmid);
      this.vms[nodeName].forEach((vm: { vmid: number }) => {
        this.fetchVMStatus(nodeName, vm.vmid);
        this.fetchVMStorage(nodeName, vm.vmid);
      });
    });
  }

  // Fetch VM status (running, stopped, etc.)
fetchVMStatus(nodeName: string, vmid: number) {
    this.proxmoxService.getVMStatus(nodeName, vmid).subscribe((data) => {
      const vm = this.vms[nodeName]?.find((vm: any) => vm.vmid === vmid && vm.status === 'running');
      if (vm) {
        vm.status = data.status;
        vm.statusInfo = data;  // Store full status info
      }
    });
  }

fetchVMStorage(nodeName: string, vmid: number) {
  this.proxmoxService.getVMStorage(nodeName, vmid).subscribe((data) => {
    const vm = this.vms[nodeName]?.find((vm: any) => vm.vmid === vmid && vm.status === 'running');
    if (vm) {
      // Filter out host filesystems and loop devices
      const vmDisks = data.result.result.filter((disk: { mountpoint: string; type: string | string[]; }) => 
        !disk.mountpoint?.startsWith('/snap') && 
        !disk.mountpoint?.startsWith('/boot') &&
        // !disk.mountpoint?.startsWith('/home') &&
        !disk.type?.includes('squashfs')
      );
      
      const diskUsage = this.calculateTotalDiskUsage(vmDisks);
      vm.diskUsed = diskUsage.used;
      vm.diskTotal = diskUsage.total;
      vm.diskPercentage = diskUsage.percentage;
    }
  });
}

  // Update disk calculation to handle filtered disks
  calculateTotalDiskUsage(disks: any[]): { used: number, total: number, percentage: number } {
    let totalBytes = 0;
    let usedBytes = 0;

    disks.forEach(disk => {
      if (disk['total-bytes'] && disk['used-bytes']) {
        totalBytes += disk['total-bytes'];
        usedBytes += disk['used-bytes'];
      }
    });

    const percentage = totalBytes ? (usedBytes / totalBytes) * 100 : 0;
    return { used: usedBytes, total: totalBytes, percentage };
  }

  // Start VM
  startVM(nodeName: string, vmid: number) {
    this.proxmoxService.startVM(nodeName, vmid).subscribe(() => {
      this.toastService.success("Power Operation", `VM ${vmid} on ${nodeName} is starting!`);
      setTimeout(() => {
        this.fetchVMStatus(nodeName, vmid);
      }, this.delayRefresh);
    });
  }

  // Stop VM
  stopVM(nodeName: string, vmid: number) {
    this.proxmoxService.stopVM(nodeName, vmid).subscribe(() => {
      this.toastService.error("Power Operation", `VM ${vmid} on ${nodeName} is stopping!`);
      setTimeout(() => {
        this.fetchVMStatus(nodeName, vmid);
      }, this.delayRefresh);
    });
  }

  // Shutdown VM
  shutdownVM(nodeName: string, vmid: number) {
    this.proxmoxService.shutdownVM(nodeName, vmid).subscribe(() => {
      this.toastService.error("Power Operation", `VM ${vmid} on ${nodeName} is shutting down!`);
      setTimeout(() => {
        this.fetchVMStatus(nodeName, vmid);
      }, this.delayRefresh);
    });
  }

  // Restart VM
  restartVM(nodeName: string, vmid: number) {
    this.stopVM(nodeName, vmid);
    setTimeout(() => {
      this.startVM(nodeName, vmid);
    }, this.delayRefresh * 2);
  }

  fetchNodeInfo(nodeName: string) {
    this.proxmoxService.getNodeInfo(nodeName).subscribe({
      next: (data) => {
        this.nodeInfo[nodeName] = data;
      },
      error: (err) => {
        console.warn(`⚠️ Failed to fetch info for node "${nodeName}":`, err.message || err);
        // Optional: You can even show a toast
        // this.toastService.warn('Node Offline', `Could not retrieve info for node "${nodeName}".`);
      }
    });
  }


  // Update node info periodically
  startUpdatingNodeInfo() {
    this.nodeInfoDelay = setInterval(() => {
      this.nodes.forEach(node => {
        this.fetchNodeInfo(node.node);
      });
    }, this.delayUpdateInfo);
  }

  // Fetch nodes from Proxmox
  fetchNodes() {
    this.proxmoxService.getNodes().subscribe((data) => {
      this.nodes = data;
      const predefinedOrder = ['pve'];
      this.nodes.sort((a, b) => {
        const indexA = predefinedOrder.indexOf(a.node);
        const indexB = predefinedOrder.indexOf(b.node);
        return indexA === -1 ? 1 : (indexB === -1 ? -1 : indexA - indexB);
      });
      this.nodes.forEach(node => {
        this.fetchNodeInfo(node.node);
        this.isCollapsed[node.node] = false;
      });
    });
  }

  // Load permissions for the user
  loadPermissions(): void {
    const userPermissions = sessionStorage.getItem('permissions');
    if (userPermissions) {
      try {
        this.userPermissions = JSON.parse(userPermissions).map((p: { name: string }) => p.name);
      } catch (error) {
        console.error('Failed to parse permissions:', error);
        this.userPermissions = [];
      }
    }
  }

  // Check if user has a certain permission
  hasPermission(permission: string): boolean {
    return (
      this.userPermissions.includes(permission) || this.userPermissions.includes('admin')
    );
  }


}
