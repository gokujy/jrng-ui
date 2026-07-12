import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth.page').then((m) => m.AuthPage),
    data: { mode: 'login' },
    title: 'Sign in — Admin Starter',
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth.page').then((m) => m.AuthPage),
    data: { mode: 'forgot' },
    title: 'Reset password — Admin Starter',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard.page').then((m) => m.DashboardPage),
        title: 'Dashboard — Admin Starter',
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users.page').then((m) => m.UsersPage),
        title: 'Users — Admin Starter',
      },
      {
        path: 'users/new',
        loadComponent: () => import('./pages/user-form.page').then((m) => m.UserFormPage),
        title: 'Create user — Admin Starter',
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./pages/user-form.page').then((m) => m.UserFormPage),
        title: 'Edit user — Admin Starter',
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/account.page').then((m) => m.AccountPage),
        data: { page: 'profile' },
        title: 'Profile — Admin Starter',
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/account.page').then((m) => m.AccountPage),
        data: { page: 'settings' },
        title: 'Settings — Admin Starter',
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/account.page').then((m) => m.AccountPage),
        data: { page: 'notifications' },
        title: 'Notifications — Admin Starter',
      },
      {
        path: 'states',
        loadComponent: () => import('./pages/states.page').then((m) => m.StatesPage),
        title: 'Application states — Admin Starter',
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
