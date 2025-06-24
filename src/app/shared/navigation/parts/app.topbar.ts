import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule, Menu } from 'primeng/menu';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../../../core/services/layout';
import { AuthService } from '../../../core/services/auth';
import { UserService } from '../../../core/services/user';
import { UserDto } from '../../dto/user.dto';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, MenuModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <img src="./elektropanel.svg" alt="Logo" class="layout-topbar-logo-image" [height]="48" [width]="48" />
                <span>ElektroPanel</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <app-configurator />

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>
                    <div class="relative">
                        <button 
                            type="button" 
                            class="layout-topbar-action"
                            (click)="toggleProfileMenu($event)"
                        >
                            <i class="pi pi-user"></i>
                            <span>Profile</span>
                        </button>
                        <p-menu 
                            #profileMenu
                            [model]="profileItems" 
                            [popup]="true"
                            styleClass="min-w-[12rem] w-auto"
                            [appendTo]="'body'"
                            position="bottom-right"
                        ></p-menu>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    styles:`
        .p-menu {
            padding: 0.5rem 0;
            border-radius: 0.375rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* Per le voci del menu */
        .p-menuitem {
            min-width: 10rem;
        }
    `
})
export class AppTopbar implements OnInit {
    @ViewChild('profileMenu') profileMenu!: Menu;

    profileItems: MenuItem[] = [];
    userPermissions: any[] = [];

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private userService: UserService
    ) {}

    ngOnInit() {
        this.loadUserPermissions();
    }

    loadUserPermissions() {
        this.userService.getUserInfo().subscribe((info: UserDto) => {
            this.userPermissions = info.permissions;
            this.updateProfileMenu();
        });
        
    }

    hasPermission(permission: string): boolean {
        return this.userPermissions.some(p => p.name === permission);
    }

    updateProfileMenu() {
        this.profileItems = [
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                routerLink: '/settings'
            },
            ...(this.hasPermission('ADMIN') ? [{
                label: 'Admin',
                icon: 'pi pi-shield',
                routerLink: '/admin'
            }] : []),
            {
                separator: true
            },
            {
                label: 'Logout',
                icon: 'pi pi-power-off',
                command: () => this.logout(),
                styleClass: 'text-red-500 hover:text-red-700'
            }
        ];
    }

    toggleProfileMenu(event: Event) {
        this.profileMenu.toggle(event);
    }

logout() {
  this.authService.logout().subscribe({
    next: () => {
      window.location.href = '/';
    },
    error: (err) => {
      console.error('Logout failed', err);
    }
  });
}
}