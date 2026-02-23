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
import { environment } from '../../../../environments/environment';


@Component({
    selector: 'app-user-assignment',
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, ToastModule],
    providers: [MessageService],
    templateUrl: './user-assignment.component.html',
    styleUrls: ['./user-assignment.component.scss']
})
export class UserAssignmentComponent implements OnInit {
    isCreateMode: boolean = false;
    pageTitle: string = '';

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

        const mode = this.route.snapshot.queryParamMap.get('mode');

        if (userId === 'create') {
            this.isCreateMode = true;
            this.pageTitle = 'Create User';
            this.user = { ...this.user, staffID: 0 } as StaffModel;
        } else if (userId) {
            this.isCreateMode = false;
            // if navigated via edit button, set title; if via row click, keep empty
            this.pageTitle = mode === 'edit' ? 'Edit User' : '';
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
            error: () => { }
        });
    }

    private loadDepartments(): void {
        this.departmentService.get().subscribe({
            next: (res) => {
                const data = res.data as DepartmentModel[] | any;
                if (Array.isArray(data)) this.availableDepartments = data;
            },
            error: () => { }
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

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.user.staffEmail)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Invalid Email',
                detail: 'Please enter a valid email address',
                life: 3000
            });
            return;
        }

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

    getProfileUrl(profilePath: string | null | undefined): string {
        if (!profilePath) return '';
        if (/^(https?:)?\/\//.test(profilePath)) return profilePath;
        const trimmed = profilePath.replace(/^\/+/, '');
        let base = (environment.main_url ?? '').replace(/\/+$/, '');
        base = base.replace(/\/api$/, ''); // ensure we don't keep a trailing /api
        return base ? `${base}/${trimmed}` : `/${trimmed}`;
    }

    resetPassword(): void {
        if (this.isCreateMode) {
            this.messageService.add({
                severity: 'info',
                summary: 'Info',
                detail: 'Password will be sent to user email after account creation',
                life: 3000
            });
            return;
        }

        this.messageService.add({
            severity: 'info',
            summary: 'Password Reset',
            detail: 'Password reset link has been sent to the user\'s email',
            life: 3000
        });
    }

    goBack(): void {
        this.router.navigate(['/user-accounts']);
    }
}