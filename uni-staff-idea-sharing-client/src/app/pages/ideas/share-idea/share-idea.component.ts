import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CategoryModel } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { DocumentService } from '../../../core/services/ideas/document.service';
import { IdeaCategoryService } from '../../../core/services/ideas/idea-category.service';
import { IdeaService } from '../../../core/services/ideas/idea.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-share-idea',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './share-idea.component.html',
  styleUrl: './share-idea.component.scss'
})
export class ShareIdeaComponent implements OnInit {

  name = '';
  staffID = '';
  profilePicture = '';
  profilePictureUrl: string = '';
  currentDate = new Date();

  // Form State
  title: string = '';
  description: string = '';
  selectedCategoryId: number | null = null;
  agreedToTerms: boolean = false;
  selectedFiles: File[] = [];

  categories: CategoryModel[] = [];

  constructor(
    private categoryService: CategoryService,
    private ideaService: IdeaService,
    private ideaCategoryService: IdeaCategoryService,
    private documentService: DocumentService,
    private messageService: MessageService,
    private location: Location,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
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
        this.profilePictureUrl = `${environment.web_url.replace(/\/$/, '')}/uploads/staff_profiles/${basename}`;
      }
    } else {
      this.profilePictureUrl = '';
    }

    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.get().subscribe({
      next: (res) => {
        this.categories = res.data as CategoryModel[];
      },
      error: () => console.error('Failed to load categories')
    });
  }

  onFileSelect(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      for (let file of event.target.files) {
        this.selectedFiles.push(file);
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }


  // Central submission logic
  submit(isAnonymous: boolean): void {
    if (!this.title || !this.description) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'Title and Description are required.' });
      return;
    }
    if (!this.selectedCategoryId) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'Please choose a category.' });
      return;
    }
    if (!this.agreedToTerms) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'You must agree to the terms and conditions.' });
      return;
    }

    const ideaPayload: any = {
      title: this.title,
      description: this.description,
      isAnonymous: isAnonymous,
      staffID: Number(this.staffID), // Ensures it is passed as a number
      settingID: 1,
      status: 'pending'
    };

    this.ideaService.create(ideaPayload).subscribe({
      next: (ideaRes: any) => {
        const createdIdeaId = ideaRes.data.ideaID;

        this.ideaCategoryService.store({ ideaID: createdIdeaId, categoryID: this.selectedCategoryId! }).subscribe();

        if (this.selectedFiles.length > 0) {
          this.selectedFiles.forEach((file) => {
            const simulatedPath = `uploads/ideas/${Date.now()}_${file.name}`;
            this.documentService.store({ docPath: simulatedPath, ideaID: createdIdeaId }).subscribe();
          });
        }

        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Idea posted successfully!' });
        setTimeout(() => this.goBack(), 1500);
      },
      error: (err) => {
        console.error('Error posting idea:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to post idea.' });
      }
    });
  }
  clearForm(): void {
    this.title = '';
    this.description = '';
    this.selectedCategoryId = null;
    this.agreedToTerms = false;
    this.selectedFiles = [];
  }

  goBack(): void {
    this.location.back();
  }
}