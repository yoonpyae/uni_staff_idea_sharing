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
import { StaffModel, ViewStaffModel } from '../../../core/models/staff.model';
import { RoleModel } from '../../../core/models/role.model';
import { StaffService } from '../../../core/services/staff.service';

@Component({
  selector: 'app-user-account',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './user-account.component.html',
  styleUrl: './user-account.component.scss'
})
export class UserAccountComponent implements OnInit {
  @ViewChild('dt') table!: Table;

  users: ViewStaffModel[] = [];
  selectedUser!: ViewStaffModel;

  roles: RoleModel[] = [];
  searchQuery: string = '';

  // Pagination
  rows: number = 10;
  rowsPerPageOptions = [5, 10, 20, 50];

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private staffService: StaffService,
  ) { }

  private formBuilder = inject(FormBuilder);
  public staffForm: FormGroup = this.formBuilder.group({
    staffName: ['', Validators.required],
    staffEmail: ['', [Validators.required, Validators.email]],
    staffPhone: [''],
    staffDOB: [''],
    staffAddress: [''],
    staffProfile: [''],
    departmentID: [0, Validators.required],
    roleID: [0, Validators.required],
  });

  ngOnInit(): void {
    this.loadUsers();
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

  createUser(): void {
    this.router.navigate(['/user-accounts/create']);
  }

  editUser(user: StaffModel): void {
    this.router.navigate(['/user-accounts', user.staffID]);
  }

  deleteUser(user: StaffModel): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.staffName}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.users = this.users.filter(u => u.staffID !== user.staffID);

        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `User ${user.staffName} has been deleted`,
          life: 3000
        });
      }
    });
  }

  exportCSV(): void {
    this.table.exportCSV();
    this.messageService.add({
      severity: 'success',
      summary: 'Export Success',
      detail: 'User data exported to CSV',
      life: 3000
    });
  }

  exportExcel(): void {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.users);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'users');
    });
  }

  // exportPdf(): void {
  //   import('jspdf').then((jsPDF) => {
  //     import('jspdf-autotable').then(() => {
  //       const doc = new jsPDF.default();

  //       const exportColumns = [
  //         { title: 'Name', dataKey: 'name' },
  //         { title: 'Email', dataKey: 'email' },
  //         { title: 'Phone', dataKey: 'phone' },
  //         { title: 'Role', dataKey: 'role' },
  //         { title: 'Department', dataKey: 'department' },
  //         { title: 'Status', dataKey: 'status' }
  //       ];

  //       (doc as any).autoTable({
  //         columns: exportColumns,
  //         body: this.users,
  //         styles: { fontSize: 8 },
  //         headStyles: { fillColor: [168, 230, 207] }
  //       });

  //       doc.save('users.pdf');

  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'Export Success',
  //         detail: 'User data exported to PDF',
  //         life: 3000
  //       });
  //     });
  //   });
  // }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then((FileSaver) => {
      const EXCEL_TYPE =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE,
      });
      FileSaver.saveAs(
        data,
        fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Export Success',
        detail: 'User data exported to Excel',
        life: 3000
      });
    });
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
}
