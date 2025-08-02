import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Password, PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToastService } from '../../shared/toasts';
import { FluidModule } from 'primeng/fluid';
import { HttpService } from '../../core/services/httpservice';
import { UserService } from '../../core/services/user';
import { Router } from '@angular/router';
import { ThemeUtils } from '@primeng/themes';
import { debounceTime } from 'rxjs';
import { ToggleSwitchStyle } from 'primeng/toggleswitch';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    PasswordModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    FluidModule,
    ReactiveFormsModule
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings {
  currentUser = {
    displayName: 'John Doe',
    email: 'john@example.com',
    google: false
  };

  newDisplayName = '';
  emailControl = new FormControl('', [Validators.email]);
  newEmail = '';
  emailInUse = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  deletePassword = '';
  displayDeleteDialog = false;
  isWarn = false
  errorPassword = '';
  // @ViewChild('passwordRef') passwordComponent!: Password;

  constructor(private toastService: ToastService, private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.userService.getUserInfo().subscribe({
      next: (decoded: any) => {
        this.currentUser.displayName = decoded?.name || '';
        this.currentUser.email = decoded?.email || '';
        this.currentUser.google = decoded?.google || false;
        // this.passwordComponent.disabled = this.currentUser.google;
      },
      error: () => this.showError('Failed to update email')
    });
    this.emailControl.valueChanges.pipe(debounceTime(500)).subscribe((email) => {
      this.emailInUse = false;

      if (this.emailControl.valid) {
        this.userService.checkEmailExists(email ?? '').subscribe((exists: boolean) => {
          this.emailInUse = exists;
          this.newEmail = email || '';
          if (exists) {
            this.emailControl.setErrors({ emailInUse: true });
          }
        });
      }
    });
  }

  updateDisplayName() {
    if (!this.newDisplayName) {
      this.showError('Please enter a new display name');
      return;
    }

    this.userService.updateDisplayName(this.newDisplayName).subscribe({
      next: () => {
        this.currentUser.displayName = this.newDisplayName;
        this.newDisplayName = '';
        this.showSuccess('Display name updated successfully');
      },
      error: () => this.showError('Failed to update display name')
    });
  }

  updateEmail() {
    if (this.emailControl.invalid || this.emailInUse) return;

    if (!this.newEmail) {
      this.showError('Please enter a new email');
      return;
    }

    this.userService.updateEmail(this.newEmail).subscribe({
      next: () => {
        // this.currentUser.email = this.newEmail;
        this.showSuccess(`An email was sent to ${this.newEmail}`);
        this.newEmail = '';
      },
      error: (e) => {
        if(e.status === 400){
          this.showError(e.error.message);
          return;
        }
        this.showError('Failed to update email');
      }
        // this.showError('Failed to update email')
    });
  }

  updatePassword() {
    if (!this.newPassword || !this.confirmPassword || (!this.currentPassword && !this.currentUser.google)) {
      this.showError('All password fields are required');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    this.userService.updatePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.errorPassword = '';
        this.showSuccess('Password updated successfully');
      },
      error: (err) => {
        this.showError('Failed to update password')
        this.errorPassword = "Password is incorrect."
      }
    });
  }

  showDeleteDialog() {
    this.deletePassword = '';
    this.displayDeleteDialog = true;
  }

  deleteAccount() {
    if (!this.deletePassword) {
      this.showError('Please enter your password');
      return;
    }
    this.userService.deleteAccount(this.deletePassword).subscribe({
      next: () => {
        this.showSuccess('Check your email for account deletion confirmation');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.log(err);
        this.showError('Failed to delete account')
      }
    });
  }

  private showSuccess(message: string) {
    this.toastService.success('Success', message);
  }

  private showError(message: string) {
    this.toastService.error('Error', message);
  }
}
