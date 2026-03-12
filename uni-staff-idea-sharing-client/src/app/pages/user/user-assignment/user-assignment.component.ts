import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
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
import { SelectModule } from 'primeng/select';

import { Observable } from 'rxjs';
import { DatePickerModule } from 'primeng/datepicker';


@Component({
    selector: 'app-user-assignment',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule, SelectModule, DatePickerModule],
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
    availableStatuses = ['Active', 'Inactive', 'Suspended'];

    showPassword = false;

    selectedProfileFile?: File;
    profileFileName: string = 'No file chosen';

    private formBuilder = inject(FormBuilder);
    public staffForm: FormGroup = this.formBuilder.group({
        staffID: [''],
        staffName: ['', Validators.required],
        staffEmail: ['', [Validators.required, Validators.email]],
        staffPhNo: ['', Validators.required],
        staffDOB: [new Date(), Validators.required],
        staffAddress: [''],
        staffProfile: [''],
        departmentID: [0],
        roleID: [0],
        status: ['Active']
    });

    formSubmitted: boolean = false;
    isSubmitting: boolean = false;

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

        this.loadRoles();
        this.loadDepartments();

        const mode = this.route.snapshot.queryParamMap.get('mode');

        if (userId === 'create') {
            this.isCreateMode = true;
            this.pageTitle = 'Create User';
            this.user = { ...this.user, staffID: 0 } as StaffModel;
        } else if (userId) {
            this.isCreateMode = false;
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

                    if (data.staffProfile) {
                        const parts = data.staffProfile.split('/');
                        this.profileFileName = parts[parts.length - 1] || this.profileFileName;
                    }

                    if (data.department && data.department.departmentName) {
                        this.user.departments = [data.department.departmentName];
                        this.user.departmentID = data.department.departmentID;
                    }

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

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
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

    selectRole(role: RoleModel): void {
        if (!this.user) return;
        this.user.roleID = role.roleID;
        this.user.roleName = role.roleName;
        this.user.role = role as any;
    }

    isRoleSelected(role: RoleModel): boolean {
        return this.user && this.user.roleID === role.roleID;
    }

    selectDepartment(dept: DepartmentModel): void {
        if (!this.user) return;
        this.user.departmentID = dept.departmentID;
        this.user.departments = [dept.departmentName];
        this.user.department = dept as any;
    }

    isDepartmentSelected(dept: DepartmentModel): boolean {
        return this.user && this.user.departmentID === dept.departmentID;
    }

    deactivateAccount(): void {
        this.user.status = 'Inactive';
        this.messageService.add({ severity: 'warn', summary: 'Account Deactivated', detail: 'The account has been deactivated.', life: 3000 });
    }

    private buildStaffPayload(): any {
        const rawDob = this.user.staffDOB || this.user.dob;
        let formattedDOB = '';
        if (rawDob) {
            const d = new Date(rawDob);
            if (!isNaN(d.getTime())) {
                formattedDOB = d.toISOString().split('T')[0];
            } else {
                formattedDOB = rawDob;
            }
        }

        const payload: any = {
            staffID: this.user.staffID || 0,
            staffName: this.user.staffName || this.user.name || '',
            staffPhNo: this.user.staffPhNo || this.user.phone || '',
            staffEmail: this.user.staffEmail || this.user.email || '',
            staffDOB: formattedDOB,
            staffAddress: this.user.staffAddress || this.user.address || '',
            termsAccepted: 0,
        };

        if (this.user.departmentID && this.user.departmentID > 0) {
            payload.departmentID = this.user.departmentID;
        }
        if (this.user.roleID && this.user.roleID > 0) {
            payload.roleID = this.user.roleID;
        }

        return payload;
    }

    createStaff(): void {
        const payload = this.buildStaffPayload();
        let request: Observable<any>;

        if (this.selectedProfileFile) {
            const form = new FormData();
            Object.entries(payload).forEach(([k, v]) => form.append(k, v as any));
            form.append('staffProfile', this.selectedProfileFile);
            request = this.staffService.create(form);
        } else {
            request = this.staffService.create(payload);
        }

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Created', detail: 'User created' });
                setTimeout(() => this.goBack(), 800);
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Create Failed', detail: 'Failed to create user' });
            }
        });
    }

    saveChanges(): void {
        if (!this.user || !this.user.staffID) {
            this.messageService.add({ severity: 'warn', summary: 'No user', detail: 'No user selected' });
            return;
        }

        if (this.isCreateMode) {
            this.createStaff();
            return;
        }

        const payload = this.buildStaffPayload();
        let request: Observable<any>;

        if (this.selectedProfileFile) {
            const form = new FormData();
            Object.entries(payload).forEach(([k, v]) => form.append(k, v as any));
            form.append('staffProfile', this.selectedProfileFile);
            request = this.staffService.update(this.user.staffID, form);
        } else {
            request = this.staffService.update(this.user.staffID, payload);
        }

        request.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Changes saved' });
                setTimeout(() => this.goBack(), 800);
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Failed to save changes' });
            }
        });
    }

    getProfileUrl(profilePath: string | null | undefined): string {
        if (!profilePath) return '';
        if (/^(https?:)?\/\//.test(profilePath)) return profilePath;
        const trimmed = profilePath.replace(/^\/+/, '');
        let base = (environment.main_url ?? '').replace(/\/+$/, '');
        base = base.replace(/\/api$/, '');
        return base ? `${base}/${trimmed}` : `/${trimmed}`;
    }

    onProfileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedProfileFile = input.files[0];
            this.profileFileName = this.selectedProfileFile.name;
        }
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

    clearForm(): void {
        this.user = this.getEmptyUser();
        this.selectedProfileFile = undefined;
        this.profileFileName = 'No file chosen';
    }

    private getEmptyUser(): any {
        return {
            id: 0,
            name: '',
            email: '',
            phone: '',
            password: '',
            dob: '',
            address: '',
            status: 'Active',
            department: '',
            role: ''
        };
    }
}