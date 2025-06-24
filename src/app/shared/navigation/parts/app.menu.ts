import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { UserService } from '../../../core/services/user';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {

    constructor(private userService: UserService) {}

    model: MenuItem[] = [];
    userPermissions: string[] = []

    // Define a type for permission objects if needed
    // type Permission = { name: string };

    filterMenuByPermissions(items: MenuItem[], permissions: any[]): MenuItem[] {
    return items
        .map(item => {
        // Check if the item has a permission field
        const required = item['permission']?.toUpperCase()

        if (required) {
            const hasPermission = permissions.some(p => p.name === required || p.name === "ADMIN");
            if (!hasPermission) {
                return null;
            }
        }

        // Recursively check sub-items
        if (item.items) {
            item.items = this.filterMenuByPermissions(item.items, permissions);
            // If no sub-items are visible, exclude this item too
            if (item.items.length === 0) return null;
        }

        return item;
        })
        .filter((item): item is MenuItem => !!item); // Filter out any null items
    }



    ngOnInit() {
        this.userService.getUserInfo().subscribe({
            next: (userInfo) => {
                this.userPermissions = userInfo.permissions;
                this.model = this.filterMenuByPermissions([
                    {
                        label: 'Home',
                        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }]
                    },
                    {
                        label: 'Servizi',
                        items: [
                            { label: 'Proxmox', icon: 'pi pi-fw pi-server', routerLink: ['/proxmox'], permission: "proxmox_read" },
                            { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                            { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                            { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
                            { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                            { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                            { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                            { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                            { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                            { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                            { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
                            { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                            { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                            { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                            { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
                            { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
                        ]
                    },
                    {
                        label: 'Pages',
                        icon: 'pi pi-fw pi-briefcase',
                        routerLink: ['/pages'],
                        items: [
                            {
                                label: 'Landing',
                                icon: 'pi pi-fw pi-globe',
                                routerLink: ['/landing']
                            },
                            {
                                label: 'Auth',
                                icon: 'pi pi-fw pi-user',
                                items: [
                                    {
                                        label: 'Login',
                                        icon: 'pi pi-fw pi-sign-in',
                                        routerLink: ['/auth/login']
                                    },
                                    {
                                        label: 'Error',
                                        icon: 'pi pi-fw pi-times-circle',
                                        routerLink: ['/auth/error']
                                    },
                                    {
                                        label: 'Access Denied',
                                        icon: 'pi pi-fw pi-lock',
                                        routerLink: ['/auth/access']
                                    }
                                ]
                            },
                            {
                                label: 'Crud',
                                icon: 'pi pi-fw pi-pencil',
                                routerLink: ['/pages/crud']
                            },
                            {
                                label: 'Not Found',
                                icon: 'pi pi-fw pi-exclamation-circle',
                                routerLink: ['/pages/notfound']
                            },
                            {
                                label: 'Empty',
                                icon: 'pi pi-fw pi-circle-off',
                                routerLink: ['/pages/empty']
                            }
                        ]
                    },
                    {
                        label: 'Hierarchy',
                        items: [
                            {
                                label: 'Submenu 1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    {
                                        label: 'Submenu 1.1',
                                        icon: 'pi pi-fw pi-bookmark',
                                        items: [
                                            { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                                            { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                                            { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                                        ]
                                    },
                                    {
                                        label: 'Submenu 1.2',
                                        icon: 'pi pi-fw pi-bookmark',
                                        items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                                    }
                                ]
                            },
                            {
                                label: 'Submenu 2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    {
                                        label: 'Submenu 2.1',
                                        icon: 'pi pi-fw pi-bookmark',
                                        items: [
                                            { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                                            { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                                        ]
                                    },
                                    {
                                        label: 'Submenu 2.2',
                                        icon: 'pi pi-fw pi-bookmark',
                                        items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        label: 'Get Started',
                        items: [
                            {
                                label: 'Documentation',
                                icon: 'pi pi-fw pi-book',
                                routerLink: ['/documentation']
                            },
                            {
                                label: 'View Source',
                                icon: 'pi pi-fw pi-github',
                                url: 'https://github.com/primefaces/sakai-ng',
                                target: '_blank'
                            }
                        ]
                    }
                ], this.userPermissions);
            }
        });

    }
}
