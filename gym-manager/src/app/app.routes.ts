import { Routes } from '@angular/router';
import { LicenseGuard } from './core/guards/license.guard';

export const routes: Routes = [
  {
    path: 'activate',
    loadComponent: () => import('./features/activate/activate/activate')
      .then(m => m.ActivateComponent)
  },
  {
    path: 'kiosko',  // ← tiene que estar acá, fuera del canActivate
    loadComponent: () => import('./features/kiosko/kiosko/kiosko')
      .then(m => m.KioskoComponent)
  },
  {
    path: '',
    canActivate: [LicenseGuard],
    loadChildren: () => import('./layout/layout.routes')
      .then(m => m.layoutRoutes)
  },
  {
    path: '**',
    redirectTo: ''
  }
];