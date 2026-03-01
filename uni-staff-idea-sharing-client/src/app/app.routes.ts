import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './pages/login/login.component';
import { AppLayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DepartmentComponent } from './pages/department/department.component';
import { UserAccountComponent } from './pages/user/user-account/user-account.component';
import { UserAssignmentComponent } from './pages/user/user-assignment/user-assignment.component';
import { RoleComponent } from './pages/role/role.component';
import { PermissionComponent } from './pages/role/permission/permission.component';
import { ClosureSettingComponent } from './pages/closure-setting/closure-setting.component';
import { AccountDetailsComponent } from './pages/account-details/account-details.component';

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
      {
        path: 'account-details',
        component: AccountDetailsComponent,
        data: { title: 'Account Details' },
      },
      {
        path: 'department',
        component: DepartmentComponent,
        canActivate: [roleGuard],
        data: { title: 'Department', roles: ['Administrator'] }
      },
      {
        path: 'role',
        canActivate: [roleGuard],
        data: { title: 'Role', roles: ['Administrator'] },
        children: [
          { path: '', component: RoleComponent },
          { path: 'permissions', component: PermissionComponent, data: { title: 'Role Permissions' } },
          { path: 'permissions/:id', component: PermissionComponent, data: { title: 'Role Permissions' } }
        ]
      },
      {
        path: 'user-accounts',
        canActivate: [roleGuard],
        data: { title: 'User Accounts', roles: ['Administrator'] },
        children: [
          { path: '', component: UserAccountComponent },
          { path: 'user-assignment', component: UserAssignmentComponent, data: { title: 'User Assignment' } },
          { path: 'user-assignment/:id', component: UserAssignmentComponent, data: { title: 'User Assignment' } }
        ]
      },
      {
        path: 'closure-settings',
        component: ClosureSettingComponent,
        data: { title: 'Closure Settings', roles: ['Administrator'] }
      }
    ],
  }
];