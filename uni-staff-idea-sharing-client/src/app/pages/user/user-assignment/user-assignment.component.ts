import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { StaffModel, ViewStaffModel } from '../../../core/models/staff.model';
import { StaffService } from '../../../core/services/staff.service';
import { RoleService } from '../../../core/services/role.service';
import { DepartmentService } from '../../../core/services/department.service';
import { RoleModel } from '../../../core/models/role.model';
import { DepartmentModel } from '../../../core/models/department.model';


@Component({
  selector: 'app-user-assignment',
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './user-assignment.component.html',
  styleUrls: ['./user-assignment.component.scss']
})
export class UserAssignmentComponent implements OnInit {
  isCreateMode: boolean = false;
  pageTitle: string = 'Edit User';

  user: any = {
    staffID: 0,
    staffName: '',
    staffEmail: '',
    staffPhNo: '',
    roleID: 0,
    departmentID: 0,
    staffProfile: ''
  } as StaffModel;

  availableRoles: RoleModel[] = [];
  availableDepartments: DepartmentModel[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private staffService: StaffService,
    private roleService: RoleService,
    private departmentService: DepartmentService
  ) { }


  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');

    // load roles and departments first
    this.loadRoles();
    this.loadDepartments();

    if (userId === 'create') {
      this.isCreateMode = true;
      this.pageTitle = 'Create New User';
      this.user = { ...this.user, staffID: 0 } as StaffModel;
    } else if (userId) {
      this.isCreateMode = false;
      this.pageTitle = 'Edit User';
      this.loadUser(parseInt(userId, 10));
    }
  }

  private loadUser(id: number): void {
    this.staffService.getById(id).subscribe({
      next: (res) => {
        const data = res.data as ViewStaffModel | any;
        if (data) {
          this.user = data;

          // normalize departments to array for the UI
          if (data.department && data.department.departmentName) {
            this.user.departments = [data.department.departmentName];
            this.user.departmentID = data.department.departmentID;
          }

          // ensure role selection reflects current role
          if (data.role) {
            this.user.roleID = data.role.roleID;
            this.user.roleName = data.role.roleName;
          }
        }
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Load Error', detail: 'Failed to load user' });
      }
    });
  }

  private loadRoles(): void {
    this.roleService.get().subscribe({
      next: (res) => {
        const data = res.data as RoleModel[] | any;
        if (Array.isArray(data)) this.availableRoles = data;
      },
      error: () => {}
    });
  }

  private loadDepartments(): void {
    this.departmentService.get().subscribe({
      next: (res) => {
        const data = res.data as DepartmentModel[] | any;
        if (Array.isArray(data)) this.availableDepartments = data;
      },
      error: () => {}
    });
  }

  // Select role locally — do not call API until Save
  selectRole(role: RoleModel): void {
    if (!this.user) return;
    this.user.roleID = role.roleID;
    this.user.roleName = role.roleName;
    this.user.role = role as any;
  }

  isRoleSelected(role: RoleModel): boolean {
    return this.user && this.user.roleID === role.roleID;
  }

  // Select department locally — do not call API until Save
  selectDepartment(dept: DepartmentModel): void {
    if (!this.user) return;
    this.user.departmentID = dept.departmentID;
    this.user.departments = [dept.departmentName];
    this.user.department = dept as any;
  }

  isDepartmentSelected(dept: DepartmentModel): boolean {
    return this.user && this.user.departmentID === dept.departmentID;
  }

  saveChanges(): void {
    if (!this.user || !this.user.staffID) {
      this.messageService.add({ severity: 'warn', summary: 'No user', detail: 'No user selected' });
      return;
    }

    const payload: any = {
      staffName: this.user.staffName,
      staffEmail: this.user.staffEmail,
      staffPhNo: this.user.staffPhNo,
      roleID: this.user.roleID,
      departmentID: this.user.departmentID
    };

    if (this.isCreateMode) {
      // create new user (basic fields)
      this.staffService.create(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'User created' });
          setTimeout(() => this.goBack(), 800);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Create Failed', detail: 'Failed to create user' });
        }
      });
    } else {
      this.staffService.update(this.user.staffID, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Changes saved' });
          setTimeout(() => this.goBack(), 800);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Failed to save changes' });
        }
      });
    }
  }

  resetPassword(): void {
    this.messageService.add({ severity: 'info', summary: 'Password Reset', detail: 'Password reset link sent' });
  }

  goBack(): void {
    this.router.navigate(['/user-accounts']);
  }
}

//   ngOnInit(): void {
//     const userId = this.route.snapshot.paramMap.get('id');
    
//     if (userId === 'create') {
//       this.isCreateMode = true;
//       this.pageTitle = 'Create New User';
//       this.user = this.getEmptyUser();
//     } else if (userId) {
//       this.isCreateMode = false;
//       this.pageTitle = 'Edit User';
//       this.loadUser(parseInt(userId));
//     }
//   }

//   private getEmptyUser(): UserDetail {
//     return {
//       id: 0,
//       name: '',
//       email: '',
//       phone: '',
//       role: '',
//       departments: []
//     };
//   }

//   private loadUser(id: number): void {
//     // Sample data - replace with actual API call
//     this.user = {
//       id: 10,
//       name: 'Scott Summers',
//       email: 'scottsummers123@gmail.com',
//       phone: '+9595203443',
//       role: 'Staff',
//       departments: ['English']
//     };
//   }

//   selectRole(roleName: string): void {
//     this.user.role = roleName;
//   }

//   isRoleSelected(roleName: string): boolean {
//     return this.user.role === roleName;
//   }

//   toggleDepartment(deptName: string): void {
//     const index = this.user.departments.indexOf(deptName);
//     if (index > -1) {
//       this.user.departments.splice(index, 1);
//     } else {
//       this.user.departments.push(deptName);
//     }
//   }

//   isDepartmentSelected(deptName: string): boolean {
//     return this.user.departments.includes(deptName);
//   }

//   saveChanges(): void {
//     // Validation
//     if (!this.user.name || !this.user.email || !this.user.role || this.user.departments.length === 0) {
//       this.messageService.add({
//         severity: 'warn',
//         summary: 'Validation Error',
//         detail: 'Please fill in all required fields and select at least one department',
//         life: 3000
//       });
//       return;
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(this.user.email)) {
//       this.messageService.add({
//         severity: 'error',
//         summary: 'Invalid Email',
//         detail: 'Please enter a valid email address',
//         life: 3000
//       });
//       return;
//     }

//     if (this.isCreateMode) {
//       // Create new user
//       console.log('Creating new user:', this.user);
      
//       this.messageService.add({
//         severity: 'success',
//         summary: 'User Created',
//         detail: `User ${this.user.name} created successfully`,
//         life: 3000
//       });
//     } else {
//       // Update existing user
//       console.log('Updating user:', this.user);
      
//       this.messageService.add({
//         severity: 'success',
//         summary: 'User Updated',
//         detail: 'User information updated successfully',
//         life: 3000
//       });
//     }

//     // Navigate back after a short delay
//     setTimeout(() => {
//       this.goBack();
//     }, 1500);
//   }

//   resetPassword(): void {
//     if (this.isCreateMode) {
//       this.messageService.add({
//         severity: 'info',
//         summary: 'Info',
//         detail: 'Password will be sent to user email after account creation',
//         life: 3000
//       });
//       return;
//     }

//     this.messageService.add({
//       severity: 'info',
//       summary: 'Password Reset',
//       detail: 'Password reset link has been sent to the user\'s email',
//       life: 3000
//     });
//   }

//   goBack(): void {
//     this.router.navigate(['/user-accounts']);
//   }
// }
