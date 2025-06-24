import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppConfigurator } from '../../shared/navigation/parts/app.configurator';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { Table, TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { ToastService } from '../../shared/toasts';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RouterModule,
    AppConfigurator,
    DialogModule,
    TagModule,
    TableModule,
    MultiSelectModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    IftaLabelModule,
    TooltipModule
  ],
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  permissions: any[] = [];
  selectedPermissions: any[] = [];
  selectedUser: any = null;
  displayModal = false;
  filterText: string = '';
  newPermissionName: string = '';
  @ViewChild('dt1') table: Table | undefined;

  statusOptions = [
    { label: 'Enabled', value: true, severity: 'success' },
    { label: 'Disabled', value: false, severity: 'danger' }
  ];
  loading: unknown;
  newPermissionDescription: string = '';
  currentUser = {
    email: '',
  };

  constructor(private userService: UserService, private toastService: ToastService) {}

  clear(table: Table) {
    table.clear();
  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onMultiSelectFilter(event: any) {
    this.filterText = event.filter;
  }


  ngOnInit() {
    this.loadUsers();
    this.loadPermissions();
    this.loadUserInfo();
  }

  loadUserInfo(){
    this.userService.getUserInfo().subscribe({
      next: (decoded: any) => {
        this.currentUser.email = decoded?.email || '';

      },
      error: () => this.toastService.error('Error', 'Could not get user info')
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        this.users = users;
        this.table?.reset();
      },
      error: (err: any) => {
        this.toastService.error("Error!", 'Failed to load users: ' + (err?.message || 'Unknown error'), 5000);
      }
    });
  }

  loadPermissions() {
    this.userService.getPermissions().subscribe({
      next: (perms: any[]) => {
        this.permissions = perms;
      },
      error: (err: any) => {
        console.error('Failed to load permissions', err);
      }
    });
  }

  openUserModal(user: any): void {
    this.selectedUser = user;

    // Ensure selectedPermissions only includes IDs that exist in permissions[]
    const userPermissionIds = (user.permissions || []).map((p: any) =>
      typeof p === 'string' ? p : p.id
    );

    this.selectedPermissions = [...userPermissionIds];
    this.displayModal = true;
  }


  saveUserPermissions(): void {
    if (this.selectedUser) {
      this.selectedUser.permissions = this.permissions.filter(p =>
        this.selectedPermissions.includes(p.id)
      );
      this.userService.updateUserPermissions(this.selectedUser.id, this.selectedPermissions)
        .subscribe({
          next: () => this.toastService.success('Permissions', "You updated the user's permissions"),
          error: err => this.toastService.error('Error! ', err.message)
      });
    }
    this.closeModal();
  }

  deleteUser(): void {
    if (this.selectedUser){
      this.userService.adminDeleteUser(this.selectedUser.email)
        .subscribe({
          next: (data) => {
            if(data.success){
              this.toastService.success("Account deleted!", data.message);
              this.loadUsers();
            }
          },
          error: (err) => this.toastService.error('Error! ', err.message)
      });
    }
    this.closeModal();
  }

  closeModal(): void {
    this.displayModal = false;
    this.selectedUser = null;
    this.selectedPermissions = [];
    this.newPermissionName = '';
  }

  toggleUserStatus(user: any) {
    this.userService.toggleStatus(user.id, !user.enabled).subscribe({
      next: () => {
        user.enabled = !user.enabled; // Update the local user status
      },
      error: (err: any) => {
        console.error('Failed to toggle status', err);
      },
    });
  }

  createAndSelectPermission() {
    const newPermission = {
      name: this.filterText.toUpperCase(),
      description: this.newPermissionDescription
    };

    this.userService.createUserPermission(newPermission.name, newPermission.description).subscribe({
      next: (feedback) => {
        const createdPermission = {
          id: feedback.permission.id,
          name: newPermission.name,
          description: newPermission.description
        };

        // Instead of manually adding, reload from server
        this.loadPermissions();

        // Reset form fields
        this.filterText = '';
        this.newPermissionDescription = '';

        // Select the newly created permission
        this.selectedPermissions = [...this.selectedPermissions, createdPermission.id];
      },
      error: (err: any) => {
        console.error('Failed to create permission', err);
      },
    });
  }
}