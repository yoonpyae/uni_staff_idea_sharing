import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { ActivatedRoute } from '@angular/router';
import { CategoryModel } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { DocumentService } from '../../../core/services/ideas/document.service';
import { IdeaCategoryService } from '../../../core/services/ideas/idea-category.service';
import { IdeaService } from '../../../core/services/ideas/idea.service';
import { environment } from '../../../../environments/environment';
import { StaffService } from '../../../core/services/staff.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IdeaModel } from '../../../core/models/ideas/idea.model';

@Component({
  selector: 'app-share-idea',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, MultiSelectModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './share-idea.component.html',
  styleUrl: './share-idea.component.scss'
})
export class ShareIdeaComponent implements OnInit, OnDestroy {
  isAnonymous: boolean = false;
  isLockedAnonymous: boolean = false;

  name = '';
  staffID = '';
  profilePicture = '';
  profilePictureUrl: string = '';
  currentDate = new Date();

  title: string = '';
  description: string = '';
  selectedCategoryIds: number[] = [];
  agreedToTerms: boolean = false;
  selectedFiles: File[] = [];

  categories: CategoryModel[] = [];

  isSubmitting: boolean = false;
  loadingSeconds: number = 0;

  editIdeaId: number | null = null;
  isEditMode: boolean = false;
  existingDocuments: any[] = [];
  isDeptLimitReached: boolean = false;

  private timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private ideaService: IdeaService,
    private ideaCategoryService: IdeaCategoryService,
    private documentService: DocumentService,
    private messageService: MessageService,
    private location: Location,
    private cookieService: CookieService,
    private staffService: StaffService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.checkDepartmentSubmissionLimit();

    this.route.params.subscribe(params => {
      if (params['editId']) {
        this.editIdeaId = Number(params['editId']);
        this.isEditMode = true;
        this.loadIdeaForEdit();
      }
    });

    const name = this.cookieService.get('staffName') || 'Guest';
    const staffID = this.cookieService.get('staffID') || '1';
    const profilePictureEncoded = this.cookieService.get('staffProfile') || '';
    const profilePicture = profilePictureEncoded ? decodeURIComponent(profilePictureEncoded) : '';
    this.name = name;
    this.staffID = staffID;
    this.profilePicture = profilePicture;

    if (profilePicture) {
      if (profilePicture.startsWith('http') || profilePicture.startsWith('data:')) {
        this.profilePictureUrl = profilePicture;
      } else {
        const parts = profilePicture.split('/').filter(Boolean);
        const basename = parts.length ? parts[parts.length - 1] : profilePicture;
        this.profilePictureUrl = `${environment.base_url.replace(/\/$/, '')}/uploads/staff_profiles/${basename}`;
      }
    } else {
      this.profilePictureUrl = '';
    }

    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.stopLoadingTimer();
  }
  loadCategories(): void {
    this.categoryService.get().subscribe({
      next: (res) => {
        const allCategories = res.data as CategoryModel[];
        this.categories = allCategories.filter(cat => cat.status === 'active');
      },
      error: () => console.error('Failed to load categories')
    });
  }

  loadIdeaForEdit(): void {
    if (!this.editIdeaId) return;
    this.ideaService.getById(this.editIdeaId).subscribe({
      next: (res) => {
        const idea = res.data;
        this.title = idea.title;
        this.description = idea.description;
        this.selectedCategoryIds = idea.categories.map((c: any) => c.categoryID);

        this.agreedToTerms = true;

        this.existingDocuments = idea.documents || [];

        if (idea.isAnonymous) {
          this.isAnonymous = true;
          this.isLockedAnonymous = true;
        }
      }
    });
  }

  onFileSelect(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];

      files.forEach(file => {
        this.selectedFiles.push(file);
      });
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  submit(): void {
    if (!this.title || !this.description) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'Title and Description are required.' });
      return;
    }
    if (this.selectedCategoryIds.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'Please choose at least one category.' });
      return;
    }
    if (!this.agreedToTerms) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'You must agree to the terms and conditions.' });
      return;
    }

    this.isSubmitting = true;
    this.loadingSeconds = 0;
    this.timerInterval = setInterval(() => {
      this.loadingSeconds++;
    }, 1000);

    const today = new Date().toISOString().split('T')[0];
    const termsPayload = {
      termsAccepted: 1,
      termsAcceptedDate: today
    };

    this.staffService.update(Number(this.staffID), termsPayload).subscribe({
      next: () => {
        this.postIdeaData(this.isAnonymous);
      },
      error: (err) => {
        this.stopLoadingTimer();
        console.error('Failed to update terms:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to accept terms. Please try again.' });
      }
    });
  }

  private postIdeaData(isAnonymous: boolean): void {
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('description', this.description);
    formData.append('isAnonymous', isAnonymous ? '1' : '0');
    formData.append('staffID', this.staffID.toString());
    if (!this.isEditMode) {
      formData.append('status', 'pending');
    }

    this.selectedCategoryIds.forEach(id => {
      formData.append('categoryIDs[]', id.toString());
    });

    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file) => {
        formData.append('documents[]', file, file.name);
      });
    }

    if (this.isEditMode && this.editIdeaId) {
      this.ideaService.update(this.editIdeaId, formData as any).subscribe({
        next: () => this.handleSuccess('Idea updated successfully!'),
        error: (err) => {
          this.stopLoadingTimer();
          console.error('Error updating idea:', err);
          const errorDetail = err.error?.message || 'Failed to update idea.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: errorDetail });
        }
      });
    } else {

      this.ideaService.create(formData as any).subscribe({
        next: (ideaRes: any) => {
          this.stopLoadingTimer();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Idea posted successfully!' });
          setTimeout(() => this.goBack(), 1500);
        },
        error: (err) => {
          this.stopLoadingTimer();
          console.error('Error posting idea:', err);
          const errorDetail = err.error?.message || 'Failed to post idea.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: errorDetail });
        }
      });
    }
  }

  stopLoadingTimer(): void {
    this.isSubmitting = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  clearForm(): void {
    this.title = '';
    this.description = '';
    this.selectedCategoryIds = [];
    this.agreedToTerms = false;
    this.selectedFiles = [];
  }

  goBack(): void {
    this.location.back();
  }

  private handleSuccess(msg: string) {
    this.stopLoadingTimer();
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
    setTimeout(() => this.goBack(), 1500);
  }

  getFileName(path: string): string {
    if (!path) return 'Document';
    return path.split('/').pop() || 'Document';
  }

  removeExistingFile(docID: number, index: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to permanently remove this saved file?',
      accept: () => {
        this.documentService.delete(docID).subscribe({
          next: () => {
            this.existingDocuments.splice(index, 1);
            this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'File deleted from server.' });
          }
        });
      }
    });
  }

  checkDepartmentSubmissionLimit(): void {
    this.ideaService.get().subscribe({
      next: (res) => {
        const ideas = res.data as IdeaModel[];
        const userDeptID = this.cookieService.get('departmentID');

        const deptIdeaExists = ideas.some(idea =>
          idea.staff?.departmentID === Number(userDeptID) &&
          idea.status !== 'deleted'
        );

        if (deptIdeaExists && !this.isEditMode) {
          this.isDeptLimitReached = true;
        }
      }
    });
  }
}