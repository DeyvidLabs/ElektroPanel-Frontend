export interface NodeDTO {
  node: string;        // Node name (e.g., "pve")
  status?: string;     // online/offline
  maxcpu?: number;     // number of CPUs
  maxmem?: number;     // total memory
  maxdisk?: number;    // total disk
  cpu?: number;        // current CPU usage fraction
  level?: string;      // privilege level (optional)
}


export interface VMDTO {
  vmid: number;                   // VM ID
  name?: string;                  // VM name
  status: 'running' | 'stopped';  // Proxmox status
  statusInfo?: any;               // full status info from API (can refine later)
  diskUsed?: number;              // calculated disk usage
  diskTotal?: number;             // total disk capacity
  diskPercentage?: number;        // percentage used
}
