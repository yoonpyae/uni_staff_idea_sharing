import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { CategoryModel } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-category',
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
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
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
export class CategoryComponent implements OnInit {
  categories: CategoryModel[] = [];
  filteredCategories: CategoryModel[] = [];
  searchQuery: string = '';

  // Dialog
  displayDialog: boolean = false;
  dialogTitle: string = 'Add Category';
  editingCategory: CategoryModel | null = null;

  constructor(
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }


  private formBuilder = inject(FormBuilder);
  public categoryForm: FormGroup = this.formBuilder.group({
    categoryID: [0],
    categoryname: ['', Validators.required],
    status: [],
    created_at: [''],
    updated_at: ['']
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.get().subscribe({
      next: (res) => {
        this.categories = res.data as CategoryModel[];
        this.filteredCategories = [...this.categories];
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredCategories = [...this.categories];
      return;
    }

    this.filteredCategories = this.categories.filter(cat =>
      cat.categoryname.toLowerCase().includes(query)
    );
  }

  openAddDialog(): void {
    this.dialogTitle = 'Add Category';
    this.editingCategory = null;
    this.categoryForm.reset();
    this.displayDialog = true;
  }

  openEditDialog(category: CategoryModel): void {
    this.dialogTitle = 'Edit Category';
    this.editingCategory = category;
    this.categoryForm.patchValue({
      categoryname: category.categoryname
    });
    this.displayDialog = true;
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.categoryForm.reset();
    this.editingCategory = null;
  }

  savecategory(): void {
    if (this.categoryForm.invalid) {
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });
      return;
    }

    let model = this.categoryForm.value as CategoryModel;

    if (this.editingCategory) {
      const updatePayload: any = { categoryname: model.categoryname };

      this.categoryService.update(this.editingCategory.categoryID, updatePayload).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          this.loadCategories();
          this.closeDialog();
        },
        error: (err) => {
          console.error('Update category failed:', err);
          this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: err?.error?.message || 'Failed to update category' });
        }
      });
    } else {
      const payload: any = { categories: [model.categoryname] };

      console.log('Create payload:', payload);
      this.categoryService.create(payload).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          this.loadCategories();
          this.closeDialog();
        },
        error: (err) => {
          console.error('Create category failed:', err);
          this.messageService.add({ severity: 'error', summary: 'Create Failed', detail: err?.error?.message || 'Failed to create category' });
        }
      });
    }
  }

  deleteCategory(category: CategoryModel): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate ${category.categoryname}?`,
      header: 'Deactivate Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoryService.delete(category.categoryID).subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deactivated',
              detail: `Category ${category.categoryname} has been marked as inactive`,
              life: 3000
            });
            this.loadCategories();
          },
          // CAPTURE BACKEND ERROR
          error: (err) => {
            console.error('Category deactivation failed:', err);

            // Extract the message from the backend response or use a fallback
            const errorMessage = err.error.message || `Failed to deactivate ${category.categoryname}. Please try again.`;

            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage,
              life: 5000 // Error messages usually stay longer for readability
            });
          }
        });
      }
    });
  }

  getFieldError(fieldcategoryname: string): string {
    const control = this.categoryForm.get(fieldcategoryname);
    if (control?.hasError('required')) {
      return `${fieldcategoryname.charAt(0).toUpperCase() + fieldcategoryname.slice(1)} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `${fieldcategoryname.charAt(0).toUpperCase() + fieldcategoryname.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }

  isFieldInvalid(fieldcategoryname: string): boolean {
    const control = this.categoryForm.get(fieldcategoryname);
    return !!(control && control.invalid && control.touched);
  }
}