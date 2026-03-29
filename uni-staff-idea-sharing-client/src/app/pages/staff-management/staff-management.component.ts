import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { ViewStaffModel } from '../../core/models/staff.model';
import { DepartmentService } from '../../core/services/department.service';
import { RoleService } from '../../core/services/role.service';
import { StaffService } from '../../core/services/staff.service';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-staff-management',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    DropdownModule
  ],
  standalone: true,
  providers: [ConfirmationService, MessageService],
  templateUrl: './staff-management.component.html',
  styleUrl: './staff-management.component.scss'
})
export class StaffManagementComponent implements OnInit {
  @ViewChild('dt') table!: Table;

  users: ViewStaffModel[] = [];
  selectedUser!: ViewStaffModel;

  searchQuery: string = '';

  // Pagination
  rows: number = 10;
  rowsPerPageOptions = [5, 10, 20, 50];

  // filter dropdown options fetched from server
  roleFilterOptions: Array<{ label: string; value: string }> = [];

  currentStaffID: number = 0;
  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private staffService: StaffService,
    private roleService: RoleService,
    private departmentService: DepartmentService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    const staffIdStr = this.cookieService.get('staffID');
    this.currentStaffID = staffIdStr ? Number(staffIdStr) : 0;

    this.loadUsers();
    this.loadFilterLists();
  }

  private loadUsers(): void {
    const deptId = this.cookieService.get('departmentID');
    if (deptId) {
      this.departmentService.getStaffByDepartment(Number(deptId)).subscribe({
        next: (res) => {
          this.users = res.data as ViewStaffModel[];
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Load Error',
            detail: 'Failed to load user accounts',
            life: 3000
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Access Denied',
        detail: 'No department associated with your account.'
      });
    }
  }

  onGlobalFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.table.filterGlobal(value, 'contains');
  }

  getProfileUrl(profilePath: string | null | undefined): string {
    if (!profilePath) return '';
    if (/^(https?:)?\/\//.test(profilePath)) return profilePath;
    const trimmed = profilePath.replace(/^\/+/, '');
    let base = (environment.main_url ?? '').replace(/\/+$/, '');
    base = base.replace(/\/api$/, ''); // strip accidental "/api"
    return base ? `${base}/${trimmed}` : `/${trimmed}`;
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Administrator': return 'text-orange-600 dark:text-orange-400';
      case 'QA Manager': return 'text-orange-600 dark:text-orange-400';
      case 'QA Coordinator': return 'text-orange-600 dark:text-orange-400';
      case 'Staff': return 'text-orange-500 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  }

  getDepartmentColor(dept: string): string {
    return 'text-blue-600 dark:text-blue-400';
  }

  get roleOptions() {
    return this.roleFilterOptions;
  }

  private loadFilterLists(): void {
    this.roleService.get().subscribe({
      next: (res) => {
        const data = res.data as any[];
        if (Array.isArray(data)) {
          this.roleFilterOptions = data.map(r => ({ label: r.roleName, value: r.roleName }));
        }
      },
      error: () => { }
    });
  }

  toggleAccountStatus(user: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (user.staffID === this.currentStaffID) {
      event.preventDefault();
      checkbox.checked = !checkbox.checked; // Revert visually
      this.messageService.add({
        severity: 'warn',
        summary: 'Action Denied',
        detail: 'You cannot disable your own account.',
        life: 3000
      });
      return;
    }

    const originalStatus = user.account_status;
    const newStatus = originalStatus === 'active' ? 'disabled' : 'active';

    this.staffService.updateStatus(user.staffID, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          user.account_status = newStatus;
          this.messageService.add({
            severity: 'success',
            summary: 'Status Updated',
            detail: `${user.staffName} is now ${newStatus}`,
            life: 3000
          });
        }
      },
      error: (err) => {
        console.error('Update failed', err);
        checkbox.checked = (originalStatus === 'disabled');

        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: err.error?.message || 'Could not change account status',
          life: 3000
        });
      }
    });
  }
}
