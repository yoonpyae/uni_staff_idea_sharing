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
import { StaffManagementComponent } from './pages/staff-management/staff-management.component';
import { CategoryComponent } from './pages/category/category.component';
import { IdeaFeedComponent } from './pages/ideas/idea-feed/idea-feed.component';
import { ShareIdeaComponent } from './pages/ideas/share-idea/share-idea.component';
import { IdeaDeatilComponent } from './pages/ideas/idea-deatil/idea-deatil.component';
import { PendingIdeasComponent } from './pages/ideas/pending-ideas/pending-ideas.component';
import { StaffIdeaFeedComponent } from './pages/ideas/staff-idea-feed/staff-idea-feed.component';
import { ReportManagementComponent } from './pages/ideas/report-management/report-management.component';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'staff-idea-feed',
    component: StaffIdeaFeedComponent,
    canActivate: [roleGuard],
    data: { title: 'Idea Feed', roles: ['Staff'] }
  },
  {
    path: 'staff-share-idea',
    component: ShareIdeaComponent,
    canActivate: [permissionGuard],
    data: { title: 'Share New Idea', permissions: ['Submit Ideas'] }
  },
  {
    path: 'staff-idea-detail/:id',
    component: IdeaDeatilComponent,
    canActivate: [roleGuard],
    data: { title: 'Idea Details', roles: ['Staff'] }
  },
  {
    path: 'staff-account-details',
    component: AccountDetailsComponent,
    data: { title: 'Staff Account Details', roles: ['Staff'] }
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [roleGuard],
    data: { roles: ['Administrator', 'QA Manager', 'QA Coordinator'] },
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'account-details',
        component: AccountDetailsComponent,
        canActivate: [roleGuard],
        data: { title: 'Account Details' },
      },
      {
        path: 'department',
        component: DepartmentComponent,
        canActivate: [permissionGuard],
        data: { title: 'Department', permissions: ['Manage Departments'] }
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
        canActivate: [permissionGuard],
        data: { title: 'User Accounts', permissions: ['Manage User Accounts'] },
        children: [
          { path: '', component: UserAccountComponent },
          { path: 'user-assignment', component: UserAssignmentComponent, data: { title: 'User Assignment' } },
          { path: 'user-assignment/:id', component: UserAssignmentComponent, data: { title: 'User Assignment' } }
        ]
      },
      {
        path: 'closure-settings',
        component: ClosureSettingComponent,
        canActivate: [permissionGuard],
        data: { title: 'Closure Settings', permissions: ['Manage Closure Dates'] }
      },
      {
        path: 'idea-categories',
        canActivate: [permissionGuard],
        data: { title: 'Categories', permissions: ['Manage Idea Categories'] },
        component: CategoryComponent,
      },
      {
        path: 'submit-ideas',
        canActivate: [permissionGuard],
        data: { title: 'Ideas', permissions: ['Submit Ideas'] },
        children: [
          { path: '', component: IdeaFeedComponent },
          { path: 'idea-detail', component: IdeaDeatilComponent, data: { title: 'Idea Details' } },
          { path: 'idea-detail/:id', component: IdeaDeatilComponent, data: { title: 'Idea Details' } },
          { path: 'share-idea', component: ShareIdeaComponent, data: { title: 'Share New Idea' } },
        ]
      },
      {
        path: 'staff-management',
        component: StaffManagementComponent,
        canActivate: [permissionGuard],
        data: { title: 'Staff Management', permissions: ['Manage Staff'] }
      },
      {
        path: 'pending-ideas',
        component: PendingIdeasComponent,
        canActivate: [permissionGuard],
        data: { title: 'Pending Ideas', permissions: ['Manage Pending Ideas'] }
      },
      {
        path: 'report-management',
        component: ReportManagementComponent,
        canActivate: [permissionGuard],
        data: { title: 'Report Management', permissions: ['Manage Reports'] }
      }
    ],
  }
];