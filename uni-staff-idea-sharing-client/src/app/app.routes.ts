import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AppLayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DepartmentComponent } from './pages/department/department.component';
import { UserAccountComponent } from './pages/user/user-account/user-account.component';

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
        data: { title: 'Dashboard' },
      },
      // Add more routes here as you create more components
      {
        path: 'department',
        component: DepartmentComponent,
        data: { title: 'Department' },
      },
      {
        path: 'user-accounts',
        component: UserAccountComponent,
        data: { title: 'User Accounts' }
      },
      // {
      //   path: 'staff-accounts',
      //   loadComponent: () =>
      //     import('./components/staff-accounts/staff-accounts.component').then(
      //       (m) => m.StaffAccountsComponent
      //     ),
      // },
    ],
  }
];