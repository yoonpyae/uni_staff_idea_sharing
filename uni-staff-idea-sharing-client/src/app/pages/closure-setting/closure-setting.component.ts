import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ClosureSettingModel } from '../../core/models/closureSetting.model';
import { ClosureSettingService } from '../../core/services/closure-setting.service';

@Component({
  selector: 'app-closure-setting',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    DatePickerModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './closure-setting.component.html',
  styleUrl: './closure-setting.component.scss'
})
export class ClosureSettingComponent implements OnInit {
  settings: ClosureSettingModel[] = [];
  filteredSettings: ClosureSettingModel[] = [];
  searchQuery: string = '';

  showForm: boolean = false;
  isEditMode: boolean = false;

  private formBuilder = inject(FormBuilder);
  public closureForm: FormGroup = this.formBuilder.group({
    settingID: [null],
    title: ['', Validators.required],
    closureDate: [null, Validators.required],
    finalclosureDate: [null, Validators.required],
    academicYear: ['', Validators.required],
    status: ['active']
  });

  constructor(
    private closureSettingService: ClosureSettingService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.closureSettingService.get().subscribe({
      next: (res) => {
        this.settings = res.data;
        this.filteredSettings = [...this.settings];
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load settings' })
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredSettings = [...this.settings];
      return;
    }
    this.filteredSettings = this.settings.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.academicYear.toLowerCase().includes(query)
    );
  }

  openAddForm(): void {
    this.isEditMode = false;
    this.closureForm.reset();
    this.showForm = true;
  }

  openEditForm(setting: ClosureSettingModel): void {
    this.isEditMode = true;
    this.closureForm.patchValue({
      settingID: setting.settingID,
      title: setting.title,
      closureDate: setting.closureDate ? new Date(setting.closureDate) : null,
      finalclosureDate: setting.finalclosureDate ? new Date(setting.finalclosureDate) : null,
      academicYear: setting.academicYear,
      status: setting.status
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.closureForm.reset();
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : date;
  }

  saveSetting(): void {
    if (this.closureForm.invalid) {
      this.closureForm.markAllAsTouched();
      return;
    }

    const formValues = this.closureForm.value;
    const payload: ClosureSettingModel = {
      title: formValues.title,
      closureDate: this.formatDate(formValues.closureDate),
      finalclosureDate: this.formatDate(formValues.finalclosureDate),
      academicYear: formValues.academicYear,
      status: formValues.status
    };

    if (this.isEditMode && formValues.settingID) {
      this.closureSettingService.update(formValues.settingID, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Closure date updated' });
          this.loadSettings();
          this.closeForm();
        },
        error: (err) => this.handleApiError(err)
      });
    } else {
      this.closureSettingService.create(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Closure date added' });
          this.loadSettings();
          this.closeForm();
        },
        error: (err) => this.handleApiError(err)
      });
    }
  }

  deleteSetting(setting: ClosureSettingModel): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate the closure dates for ${setting.academicYear}?`,
      header: 'Deactivate Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (setting.settingID) {
          this.closureSettingService.delete(setting.settingID).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Deactivated', detail: 'Closure setting marked as inactive' });
              this.loadSettings();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to deactivate' })
          });
        }
      }
    });
  }

  private handleApiError(err: any): void {
    const msg = err.error?.message || 'An error occurred';
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
  }
}