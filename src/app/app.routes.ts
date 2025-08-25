import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public/public-layout';
import { authGuard } from './core/guards/auth-guard';
import { Navigation } from './shared/navigation/navigation';
import { Dashboard } from './pages/dashboard/dashboard';
import { Documentation } from './pages/documentation/documentation';
import { Landing } from './pages/landing/landing';
import { Notfound } from './pages/notfound/notfound';
import { Proxmox } from './pages/proxmox/proxmox';
import { ErrorComponent } from './pages/error/error';
import { AdminComponent } from './pages/admin/admin';
import { adminGuard } from './core/guards/admin-guard';
import { AuthComponent } from './pages/auth/auth';
import { Torrents } from './pages/torrents/torrents';
// export const routes: Routes = [
//   {
//     path: '',
//     component: PublicLayout,
//     children: [
//       {
//         path: '',
//         loadComponent: () => import('./pages/home/home').then(m => m.Home)
//       },
//       {
//         path: 'login',
//         loadComponent: () => import('./pages/login/login').then(m => m.Login)
//       },
//     ]
//   },
//   {
//     path: '',
//     component: Navigation,
//     canActivate: [authGuard],

//         children: [
//             { path: 'dashboard', component: Dashboard },
//             { path: 'uikit', loadChildren: () => import('./pages/uikit/uikit.routes') },
//             { path: 'documentation', component: Documentation },
//             { path: 'pages', loadChildren: () => import('./pages/pages.routes') }
//         ]
//     //   {
//     //     path: 'services',
//     //     loadComponent: () => import('./pages/services.component').then(m => m.ServicesComponent)
//     //   },
//   },
//   { path: '**', redirectTo: '' },

  
// ];
export const appRoutes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/home/home').then(m => m.Home)
            }
        ] 
    },
    {
        path: '',
        component: Navigation,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./pages/pages.routes') },
            { path: 'proxmox', component: Proxmox },
            { path: 'torrents', component: Torrents },
            { path: 'admin', component: AdminComponent, canActivate: [adminGuard]},
            { path: 'settings', loadComponent: () => import('./pages/settings/settings').then(m => m.Settings)},
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', component: AuthComponent },
    { path: 'error', component: ErrorComponent },


    { path: '**', redirectTo: '/notfound' }
];