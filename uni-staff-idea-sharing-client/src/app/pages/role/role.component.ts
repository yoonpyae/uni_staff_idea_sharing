import { trigger, transition, style, stagger, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { query } from 'express';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { RoleModel } from '../../core/models/role.model';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-role',
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
  templateUrl: './role.component.html',
  styleUrl: './role.component.scss',
  // animations: [
  //   trigger('listAnimation', [
  //     transition('* => *', [
  //       query(':enter', [
  //         style({ opacity: 0, transform: 'scale(0.95)' }),
  //         stagger(50, [
  //           animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
  //         ])
  //       ], { optional: true })
  //     ])
  //   ])
  // ]
})
export class RoleComponent implements OnInit {
  roles: RoleModel[] = [];
  filteredRoles: RoleModel[] = [];
  searchQuery: string = '';

  // Dialog
  displayDialog: boolean = false;
  dialogTitle: string = 'Add Role';
  editingRole: RoleModel | null = null;

  constructor(
    private roleService: RoleService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  private formBuilder = inject(FormBuilder);
  public roleForm: FormGroup = this.formBuilder.group({
    roleId: [0],
    roleName: ['', Validators.required],
    create_at: [''],
    updated_at: ['']
  });


  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.get().subscribe({
      next: (res) => {
        this.roles = res.data as RoleModel[];
        this.filteredRoles = [...this.roles];
      },
      error: (err) => {
        console.error('Failed to load roles:', err);
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredRoles = [...this.roles];
      return;
    }

    this.filteredRoles = this.roles.filter(role =>
      role.roleName.toLowerCase().includes(query)
      // dept.qaCoordinator.toLowerCase().includes(query)
    );
  }

  openAddDialog(): void {
    this.dialogTitle = 'Add Role';
    this.editingRole = null;
    this.roleForm.reset();
    this.displayDialog = true;
  }

  openEditDialog(role: any): void {
    this.dialogTitle = 'Edit Role';
    this.editingRole = role;
    this.roleForm.patchValue({
      roleId: role.roleId,
      roleName: role.roleName,
    });
    this.displayDialog = true;
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.roleForm.reset();
    this.editingRole = null;
  }

  saveRole(): void {
    if (this.roleForm.invalid) {
      Object.keys(this.roleForm.controls).forEach(key => {
        this.roleForm.get(key)?.markAsTouched();
      });
      return;
    }

    let model = this.roleForm.value as RoleModel;

    if (this.editingRole) {
      this.roleService.update(this.editingRole.roleID, model).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          this.loadRoles();
          this.closeDialog();
        },
        error: (err) => {
          console.error('Update role failed:', err);
          this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: err?.error?.message || 'Failed to update role' });
        }
      });
    } else {
      const payload: any = { roles: [{ roleName: model.roleName }] };
      console.log('Create payload:', payload);
      this.roleService.create(payload).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          this.loadRoles();
          this.closeDialog();
        },
        error: (err) => {
          console.error('Create role failed:', err);
          this.messageService.add({ severity: 'error', summary: 'Create Failed', detail: err?.error?.message || 'Failed to create role' });
        }
      });
    }

    // dialog is closed after successful API responses in subscriptions
  }

  deleteRole(role: RoleModel): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${role.roleName}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.roleService.delete(role.roleID).subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `Role ${role.roleName} has been deleted`,
              life: 3000
            });
            this.loadRoles();
          }
        });
      }
    });
  }

  getFieldError(fieldRoleName: string): string {
    const control = this.roleForm.get(fieldRoleName);
    if (control?.hasError('required')) {
      return `${fieldRoleName.charAt(0).toUpperCase() + fieldRoleName.slice(1)} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `${fieldRoleName.charAt(0).toUpperCase() + fieldRoleName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }

  isFieldInvalid(fieldRoleName: string): boolean {
    const control = this.roleForm.get(fieldRoleName);
    return !!(control && control.invalid && control.touched);
  }
}
