import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/authenticated/auth-layout';
import { PublicLayout } from './layouts/public/public-layout';
import { authGuard } from './core/guards/auth-guard';
import { Navigation } from './shared/navigation/navigation';
import { Dashboard } from './pages/dashboard/dashboard';
import { Documentation } from './pages/documentation/documentation';
import { Landing } from './pages/landing/landing';
import { Notfound } from './pages/notfound/notfound';
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
        component: Navigation,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    {
      path: 'login',
      loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    { path: '**', redirectTo: '/notfound' }
];