import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { environment } from '../../../../environments/environment';

import { IdeaModel } from '../../../core/models/ideas/idea.model';
import { ClosureSettingModel } from '../../../core/models/closureSetting.model';
import { IdeaService } from '../../../core/services/ideas/idea.service';
import { ClosureSettingService } from '../../../core/services/closure-setting.service';
import { DepartmentService } from '../../../core/services/department.service';

@Component({
  selector: 'app-pending-ideas',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ConfirmDialogModule, DialogModule, DropdownModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pending-ideas.component.html',
  styleUrl: './pending-ideas.component.scss'
})
export class PendingIdeasComponent implements OnInit {
  departmentName: string = 'Loading...';
  coordinatorDeptId: number = 0; searchQuery: string = '';

  pendingIdeas: IdeaModel[] = [];
  filteredIdeas: IdeaModel[] = [];

  showApproveDialog: boolean = false;
  selectedIdeaToApprove: IdeaModel | null = null;
  closureSettings: ClosureSettingModel[] = [];
  selectedSettingId: number | null = null;

  constructor(
    private ideaService: IdeaService,
    private closureSettingService: ClosureSettingService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cookieService: CookieService,
    private departmentService: DepartmentService
  ) { }

  ngOnInit(): void {
    const deptIdStr = this.cookieService.get('departmentID');
    this.coordinatorDeptId = deptIdStr ? Number(deptIdStr) : 0;

    // 2. Fetch the Department Name based on the ID
    if (this.coordinatorDeptId > 0) {
      this.fetchDepartmentName(this.coordinatorDeptId);
    }

    this.loadPendingIdeas();
    this.loadClosureSettings();
  }

  fetchDepartmentName(id: number): void {
    // Uses the GET /departments/{id} route defined in your backend
    this.departmentService.getById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.departmentName = res.data.departmentName + ' Department';
        }
      },
      error: (err) => {
        console.error('Failed to fetch department name'+ ' Department', err);
        this.departmentName = 'Your Department';
      }
    });
  }

  loadPendingIdeas(): void {
    this.ideaService.get().subscribe({
      next: (res) => {
        const allIdeas = res.data as IdeaModel[];
        this.pendingIdeas = allIdeas.filter(idea =>
          idea.status === 'pending' &&
          idea.staff?.departmentID === this.coordinatorDeptId
        );
        this.applySearch();
      },
      error: (err) => console.error('Failed to load ideas', err)
    });
  }

  loadClosureSettings(): void {
    this.closureSettingService.get().subscribe({
      next: (res) => {
        this.closureSettings = (res.data as ClosureSettingModel[]).filter(s => s.status === 'active');
      }
    });
  }

  applySearch(): void {
    if (!this.searchQuery) {
      this.filteredIdeas = [...this.pendingIdeas];
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredIdeas = this.pendingIdeas.filter(idea =>
      idea.title.toLowerCase().includes(q) || idea.description.toLowerCase().includes(q)
    );
  }

  // --- APPROVAL FLOW ---
  openApproveDialog(idea: IdeaModel): void {
    this.selectedIdeaToApprove = idea;
    this.selectedSettingId = null;
    this.showApproveDialog = true;
  }

  confirmApproval(): void {
    if (!this.selectedIdeaToApprove || !this.selectedSettingId) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'Please select an Academic Year.' });
      return;
    }

    const payload = {
      status: 'approved',
      settingID: this.selectedSettingId
    };

    this.ideaService.updateStatus(this.selectedIdeaToApprove.ideaID, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Idea is now public.' });
        this.showApproveDialog = false;
        this.loadPendingIdeas();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve idea.' })
    });
  }

  // --- REJECTION FLOW ---
  rejectIdea(idea: IdeaModel): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to reject "${idea.title}"?`,
      header: 'Confirm Rejection',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.ideaService.updateOnlyStatus(idea.ideaID, { status: 'rejected' }).subscribe({
          next: () => {
            this.messageService.add({ severity: 'info', summary: 'Rejected', detail: 'Idea has been rejected.' });
            this.loadPendingIdeas();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject.' })
        });
      }
    });
  }

  // --- HELPERS ---
  getLikesCount(idea: IdeaModel): number {
    return idea.votes?.filter(v => v.voteType === 'Like').length || 0;
  }
  getUnlikesCount(idea: IdeaModel): number {
    return idea.votes?.filter(v => v.voteType === 'Unlike').length || 0;
  }
  getCommentsCount(idea: IdeaModel): number {
    return idea.comments?.length || 0;
  }

  getProfileUrl(profilePath: string | null | undefined): string {
    if (!profilePath) return '';
    if (/^(https?:)?\/\//.test(profilePath)) return profilePath;
    const trimmed = profilePath.replace(/^\/+/, '');
    return `${environment.main_url.replace(/\/api$/, '')}/${trimmed}`;
  }
}