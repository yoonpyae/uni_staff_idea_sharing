import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AppLayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      // Add more routes here as you create more components
      // {
      //   path: 'departments',
      //   loadComponent: () =>
      //     import('./components/departments/departments.component').then(
      //       (m) => m.DepartmentsComponent
      //     ),
      // },
      // {
      //   path: 'staff-accounts',
      //   loadComponent: () =>
      //     import('./components/staff-accounts/staff-accounts.component').then(
      //       (m) => m.StaffAccountsComponent
      //     ),
      // },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];