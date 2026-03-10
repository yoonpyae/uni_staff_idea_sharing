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
  departmentFilterOptions: Array<{ label: string; value: string }> = [];

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private staffService: StaffService,
    private roleService: RoleService,
    private departmentService: DepartmentService,
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadFilterLists();
  }

  private loadUsers(): void {
    this.staffService.get().subscribe({
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

  // Add these to your component class
  /**
   * Previously computed from users list – replaced by server-loaded values.
   * Keep getters in case something else still uses them, but they now fall back
   * to the server options so behavior is consistent.
   */
  get roleOptions() {
    return this.roleFilterOptions;
  }

  get departmentOptions() {
    return this.departmentFilterOptions;
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
    this.departmentService.get().subscribe({
      next: (res) => {
        const data = res.data as any[];
        if (Array.isArray(data)) {
          this.departmentFilterOptions = data.map(d => ({ label: d.departmentName, value: d.departmentName }));
        }
      },
      error: () => { }
    });
  }

  // onToggleChange(user: ViewStaffModel, field: string) {
  //   console.log(`User ${user.staffName} changed ${field} to`, user[field]);
  //   // this.staffService.updateUserStatus(user.id, payload).subscribe(...)
  // }
}
