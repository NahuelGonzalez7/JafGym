import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell/shell';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('../features/home/home/home')
          .then(m => m.HomeComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('../features/students/students/students')
          .then(m => m.StudentsComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('../features/attendance/attendance/attendance')
          .then(m => m.AttendanceComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('../features/payments/payments/payments')
          .then(m => m.PaymentsComponent)
      },
      {
        path: 'stats',
        loadComponent: () => import('../features/stats/stats/stats')
          .then(m => m.StatsComponent)
      }
    ]
  }
];