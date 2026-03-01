import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AppLayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DepartmentComponent } from './pages/department/department.component';
import { UserAccountComponent } from './pages/user/user-account/user-account.component';
import { UserAssignmentComponent } from './pages/user/user-assignment/user-assignment.component';
import { RoleComponent } from './pages/role/role.component';
import { PermissionComponent } from './pages/role/permission/permission.component';

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
        path: 'department',
        component: DepartmentComponent,
        data: { title: 'Department' },
      },
      {
        path: 'role',
        data: { title: 'Role' },
        children: [
          { path: '', component: RoleComponent },
          { path: 'permissions', component: PermissionComponent, data: { title: 'Role Permissions' } },
          { path: 'permissions/:id', component: PermissionComponent, data: { title: 'Role Permissions' } }
        ]
      },
      {
        path: 'user-accounts',
        data: { title: 'User Accounts' },
        children: [
          { path: '', component: UserAccountComponent },
          { path: 'user-assignment', component: UserAssignmentComponent, data: { title: 'User Assignment' } },
          { path: 'user-assignment/:id', component: UserAssignmentComponent, data: { title: 'User Assignment' } }
        ]
      },
    ],
  }
];