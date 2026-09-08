import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'app', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'activar-mfa',
    loadComponent: () =>
      import('./features/auth/activar-mfa/activar-mfa.component').then(m => m.ActivarMfaComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'citas', pathMatch: 'full' },
      {
        path: 'citas',
        loadComponent: () =>
          import('./features/citas/citas.component').then(m => m.CitasComponent),
      },
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent),
      },
      {
        path: 'medicos',
        loadComponent: () =>
          import('./features/medicos/medicos.component').then(m => m.MedicosComponent),
      },
      {
        path: 'seguridad',
        loadComponent: () =>
          import('./features/perfil/seguridad-mfa.component').then(m => m.SeguridadMfaComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'app' },
];