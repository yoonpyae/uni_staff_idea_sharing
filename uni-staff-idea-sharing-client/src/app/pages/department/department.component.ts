import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { DepartmentModel } from '../../core/models/department.model';

@Component({
  selector: 'app-department',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule
  ],
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

  //Please Updaet Your Department Model
  departments: DepartmentModel[] = [];
  filteredDepartments: DepartmentModel[] = [];
  searchQuery: string = '';
  
  // Dialog
  displayDialog: boolean = false;
  dialogTitle: string = 'Add Department';
  departmentForm!: FormGroup;
  editingDepartment: DepartmentModel | null = null;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  private initializeForm(): void {
    this.departmentForm = this.fb.group({
      departmentName: ['', [Validators.required, Validators.minLength(2)]],
      qaCoordinator: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  private loadDepartments(): void {
    // Sample data - replace with actual API call
    // this.departments = [
    //   {
    //     departmentID: 1,
    //     departmentName: 'IT',
    //     qaCoordinator: 'Mike Wheeler',
    //     created_at: new Date('2026-02-13 15:41:22'),
    //     updatedAt: new Date('2026-03-22 09:15:48')
    //   },
    //   {
    //     departmentID: 2,
    //     departmentName: 'Fine Arts',
    //     qaCoordinator: 'Steve Harrington',
    //     created_at: new Date('2026-02-13 15:41:22'),
    //     updatedAt: new Date('2026-03-22 09:15:48')
    //   },
    //   {
    //     departmentID: 3,
    //     departmentName: 'Music',
    //     qaCoordinator: 'Robin Buckley',
    //     created_at: new Date('2026-02-13 15:41:22'),
    //     updatedAt: new Date('2026-03-22 09:15:48')
    //   },
    //   {
    //     departmentID: 4,
    //     departmentName: 'Literature',
    //     qaCoordinator: 'Will Byers',
    //     created_at: new Date('2026-02-13 15:41:22'),
    //     updatedAt: new Date('2026-03-22 09:15:48')
    //   },
    //   {
    //     departmentID: 5,
    //     departmentName: 'English',
    //     qaCoordinator: 'Lucas Sinclair',
    //     created_at: new Date('2026-02-13 15:41:22'),
    //     updatedAt: new Date('2026-03-22 09:15:48')
    //   },
    //   {
    //     departmentID: 6,
    //     departmentName: 'History',
    //     qaCoordinator: 'Max Mayfield',
    //     created_at: new Date('2026-02-13 15:41:22'),
    //     updatedAt: new Date('2026-03-22 09:15:48')
    //   },
    //   {
    //     departmentID: 7,
    //     departmentName: 'Science',
    //     qaCoordinator: 'Dustin Henderson',
    //     created_at: new Date('2026-02-13 15:41:22'),
    //     updatedAt: new Date('2026-03-22 09:15:48')
    //   },
    //   {
    //     departmentID: 8,
    //     departmentName: 'Business',
    //     qaCoordinator: 'Nancy Wheeler',
    //     created_at: new Date('2026-02-13 15:41:22'),
    //     updatedAt: new Date('2026-03-22 09:15:48')
    //   },
    //   {
    //     departmentID: 9,
    //     departmentName: 'Engineering',
    //     qaCoordinator: 'Jonathan Byers',
    //     created_at: new Date('2026-02-13 15:41:22'),
    //     updatedAt: new Date('2026-03-22 09:15:48')
    //   }
    // ];
    
    this.filteredDepartments = [...this.departments];
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (!query) {
      this.filteredDepartments = [...this.departments];
      return;
    }

    this.filteredDepartments = this.departments.filter(dept =>
      dept.departmentName.toLowerCase().includes(query)
      // dept.qaCoordinator.toLowerCase().includes(query)
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

    const formValue = this.departmentForm.value;

    if (this.editingDepartment) {
      // Update existing department
      const index = this.departments.findIndex(d => d.departmentID === this.editingDepartment!.departmentID);
      if (index !== -1) {
        this.departments[index] = {
          ...this.departments[index],
          departmentName: formValue.departmentName,
          // qaCoordinator: formValue.qaCoordinator,
          // updated_at: new Date()
        };
      }
    } else {
      // Add new department
      const newDepartment: any = {
        departmentID: Math.max(...this.departments.map(d => d.departmentID), 0) + 1,
        departmentName: formValue.departmentName,
        qaCoordinator: formValue.qaCoordinator,
        created_at: new Date(),
        updatedAt: new Date()
      };
      this.departments.push(newDepartment);
    }

    this.filteredDepartments = [...this.departments];
    this.closeDialog();
  }

  deleteDepartment(department: DepartmentModel): void {
    if (confirm(`Are you sure you want to delete the ${department.departmentName} department?`)) {
      this.departments = this.departments.filter(d => d.departmentID !== department.departmentID);
      this.filteredDepartments = [...this.departments];
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
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
}
