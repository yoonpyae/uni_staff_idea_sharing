import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { DepartmentModel } from '../../core/models/department.model';
import { DepartmentService } from '../../core/services/department.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-department',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  standalone: true,
  providers: [MessageService, ConfirmationService],
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.95)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class DepartmentComponent implements OnInit {
  departments: DepartmentModel[] = [];
  filteredDepartments: DepartmentModel[] = [];
  searchQuery: string = '';

  isMobileSearchOpen: boolean = false;

  // Dialog
  displayDialog: boolean = false;
  dialogTitle: string = 'Add Department';
  editingDepartment: DepartmentModel | null = null;

  constructor(
    private departmentService: DepartmentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }


  private formBuilder = inject(FormBuilder);
  public departmentForm: FormGroup = this.formBuilder.group({
    departmentId: [0],
    departmentName: ['', Validators.required],
    create_at: [''],
    updated_at: ['']
  });


  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.get().subscribe({
      next: (res) => {
        this.departments = res.data as DepartmentModel[];
        this.filteredDepartments = [...this.departments];
      },
      error: (err) => {
        console.error('Failed to load departments:', err);
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredDepartments = [...this.departments];
      return;
    }

    this.filteredDepartments = this.departments.filter(dept =>
      dept.departmentName.toLowerCase().includes(query) ||
      (dept.qa_coordinator?.staffName.toLowerCase().includes(query) ?? false)
    );
  }

  openAddDialog(): void {
    this.dialogTitle = 'Add Department';
    this.editingDepartment = null;
    this.departmentForm.reset();
    this.displayDialog = true;
  }

  openEditDialog(department: any): void {
    this.dialogTitle = 'Edit Department';
    this.editingDepartment = department;
    this.departmentForm.patchValue({
      departmentName: department.departmentName,
      qaCoordinator: department.qaCoordinator
    });
    this.displayDialog = true;
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.departmentForm.reset();
    this.editingDepartment = null;
  }

  saveDepartment(): void {
    if (this.departmentForm.invalid) {
      Object.keys(this.departmentForm.controls).forEach(key => {
        this.departmentForm.get(key)?.markAsTouched();
      });
      return;
    }

    let model = this.departmentForm.value as DepartmentModel;

    if (this.editingDepartment) {
      this.departmentService.update(this.editingDepartment.departmentID, model).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          this.loadDepartments();
          this.closeDialog();
        },
        error: (err) => {
          console.error('Update department failed:', err);
          this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: err?.error?.message || 'Failed to update department' });
        }
      });
    } else {
      const payload: any = { departments: [{ departmentName: model.departmentName }] };
      console.log('Create payload:', payload);
      this.departmentService.create(payload).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          this.loadDepartments();
          this.closeDialog();
        },
        error: (err) => {
          console.error('Create department failed:', err);
          this.messageService.add({ severity: 'error', summary: 'Create Failed', detail: err?.error?.message || 'Failed to create department' });
        }
      });
    }

    // dialog is closed after successful API responses in subscriptions
  }

  deleteDepartment(department: DepartmentModel): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${department.departmentName}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.departmentService.delete(department.departmentID).subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `Department ${department.departmentName} has been deleted`,
              life: 3000
            });
            this.loadDepartments();
          }
        });
      }
    });
  }

  getFieldError(fielddepartmentName: string): string {
    const control = this.departmentForm.get(fielddepartmentName);
    if (control?.hasError('required')) {
      return `${fielddepartmentName.charAt(0).toUpperCase() + fielddepartmentName.slice(1)} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `${fielddepartmentName.charAt(0).toUpperCase() + fielddepartmentName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }

  isFieldInvalid(fielddepartmentName: string): boolean {
    const control = this.departmentForm.get(fielddepartmentName);
    return !!(control && control.invalid && control.touched);
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen = !this.isMobileSearchOpen;
    if (!this.isMobileSearchOpen) {
      this.searchQuery = '';
      this.onSearch();
    }
  }
}
