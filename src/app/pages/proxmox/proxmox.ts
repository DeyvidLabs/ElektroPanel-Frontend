// pages/home/home.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { NodeDTO, VMDTO } from './proxmox.interface';

@Component({
  selector: 'app-proxmox',
  standalone: true,
  imports: [RouterModule, CommonModule, ProgressBarModule, CardModule, DialogModule, TagModule, ButtonModule, ToastModule],
  templateUrl: './proxmox.html',
  styleUrls: ['./proxmox.css']
})
export class Proxmox implements OnInit {

  nodes: NodeDTO[] = [];
  vms: { [key: string]: VMDTO[] } = {};
  nodeInfo: { [key: string]: any } = {}; // can later type with NodeInfoDTO
  isCollapsed: { [key: string]: boolean } = {};
  vmDialogVisible: boolean = false;
  selectedNode: string = '';
  selectedVM: VMDTO | null = null;

  delayUpdateInfo: number = 30000;
  delayUpdateVMs: number = 10000;
  delayRefresh: number = 7500;
  nodeInfoDelay: number = 0;
  
 constructor(
    private proxmoxService: ProxmoxService, 
    private toastService: ToastService,
    private route: ActivatedRoute,
  ) {}

  private handleQueryParams() {
    this.route.queryParams.subscribe((params) => {
      const node = params['node'];
      const vm = params['vm'];

      if (node) {
        this.selectedNode = node;

        this.proxmoxService.getVMs(node).subscribe((data: VMDTO[]) => {
          let vms = data.sort((a, b) => a.vmid - b.vmid);

          if (vm) {
            vms = vms.filter((x) => x.vmid == +vm);
          }

          this.vms[node] = vms;
          if (this.vms[node].length === 0) {
            this.toastService.warn("No VMs Found", `No VMs found on node "${node}".`);
            return;
          }
          this.vmDialogVisible = true;

          vms.forEach((v) => {
            this.fetchVMStatus(node, v.vmid);
            this.fetchVMStorage(node, v.vmid);
          });
        });
      }
      else if (vm) {
        for (const n of this.nodes) {
          this.proxmoxService.getVMs(n.node).subscribe((data: VMDTO[]) => {
            const found = data.find((x) => x.vmid == +vm);
            if (found) {
              this.selectedNode = n.node;
              this.vmDialogVisible = true;
              this.vms[n.node] = [found];

              this.fetchVMStatus(n.node, found.vmid);
              this.fetchVMStorage(n.node, found.vmid);
              return;
            }            
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.fetchNodes().then(() => {
      this.handleQueryParams();
    });

    this.startUpdatingNodeInfo();
  }

  ngOnDestroy(): void {
    clearInterval(this.nodeInfoDelay);
  }

  // Show modal with VM details (only if at least 1 VM is running)
// Show modal with VM details
  showVMModal(nodeName: string) {
    const nodeStatus = this.nodeInfo[nodeName]?.status;

    if (nodeStatus !== 'online') {
      this.toastService.warn("Node Offline", `Node "${nodeName}" is offline. Cannot show VMs.`);
      return;
    }

    this.selectedNode = nodeName;

    this.proxmoxService.getVMs(nodeName).subscribe((data: VMDTO[]) => {
      this.vms[nodeName] = data.sort((a, b) => a.vmid - b.vmid);

      // Fetch status/storage for all VMs
      this.vms[nodeName].forEach((vm) => {
        this.fetchVMStatus(nodeName, vm.vmid);
        this.fetchVMStorage(nodeName, vm.vmid);
      });

      // Always open modal even if all VMs are stopped/offline
      this.vmDialogVisible = true;

      if (this.vms[nodeName].length === 0) {
        this.toastService.info("No VMs", `No VMs exist on node "${nodeName}".`);
      }
    });
  }


  // Close VM Modal
  hideVMModal() {
    this.vmDialogVisible = false;
    this.selectedVM = null;
  }

  // Fetch VMs of a node
  fetchVMs(nodeName: string) {
    this.proxmoxService.getVMs(nodeName).subscribe((data: VMDTO[]) => {
      this.vms[nodeName] = data.sort((a, b) => a.vmid - b.vmid);
      this.vms[nodeName].forEach((vm) => {
        this.fetchVMStatus(nodeName, vm.vmid);
        this.fetchVMStorage(nodeName, vm.vmid);
      });
    });
  }

  // Fetch VM status (running, stopped, etc.)
  fetchVMStatus(nodeName: string, vmid: number) {
    this.proxmoxService.getVMStatus(nodeName, vmid).subscribe((data) => {
      const vm = this.vms[nodeName]?.find((vm) => vm.vmid === vmid);
      if (vm) {
        vm.status = data.status;
        vm.statusInfo = data;
      }
    });
  }

  fetchVMStorage(nodeName: string, vmid: number) {
    this.proxmoxService.getVMStorage(nodeName, vmid).subscribe((data) => {
      const vm = this.vms[nodeName]?.find((vm) => vm.vmid === vmid && vm.status === 'running');
      if (vm) {
        const vmDisks = data.result.result.filter((disk: { mountpoint: string; type: string | string[]; }) => 
          !disk.mountpoint?.startsWith('/snap') && 
          !disk.mountpoint?.startsWith('/boot') &&
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
    this.proxmoxService.startVM(nodeName, vmid).subscribe({
      next: () => {
        this.toastService.success("Power Operation", `VM ${vmid} on ${nodeName} is starting!`);
        setTimeout(() => {
          this.fetchVMStatus(nodeName, vmid);
        }, this.delayRefresh);
      },
      error: () => {
        this.toastService.error("Power Operation", `Could not start VM ${vmid} on ${nodeName}.`);
      }
    });
  }

  // Stop VM
  stopVM(nodeName: string, vmid: number) {
    this.proxmoxService.stopVM(nodeName, vmid).subscribe({
      next: () => {
        this.toastService.error("Power Operation", `VM ${vmid} on ${nodeName} is stopping!`);
        setTimeout(() => {
          this.fetchVMStatus(nodeName, vmid);
        }, this.delayRefresh);
      },
      error: () => {
        this.toastService.error("Power Operation", `Could not stop VM ${vmid} on ${nodeName}.`);
      }
    });
  }

  // Shutdown VM
  shutdownVM(nodeName: string, vmid: number) {
    this.proxmoxService.shutdownVM(nodeName, vmid).subscribe({
      next: () => {
        this.toastService.error("Power Operation", `VM ${vmid} on ${nodeName} is shutting down!`);
        setTimeout(() => {
          this.fetchVMStatus(nodeName, vmid);
        }, this.delayRefresh);
      },
      error: () => {
        this.toastService.error("Power Operation", `Could not shutdown VM ${vmid} on ${nodeName}.`);
      }
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
  fetchNodes(): Promise<void> {
    return new Promise((resolve) => {
      this.proxmoxService.getNodes().subscribe((data: NodeDTO[]) => {
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
        resolve();
      });
    });
  }
}