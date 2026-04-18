import { CommonModule, Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../../environments/environment';
import { IdeaModel } from '../../../core/models/ideas/idea.model';
import { CommentService } from '../../../core/services/ideas/comment.service';
import { IdeaService } from '../../../core/services/ideas/idea.service';
import { VoteService } from '../../../core/services/ideas/vote.service';
import { CommentModel } from '../../../core/models/ideas/comment.model';
import { ReportService } from '../../../core/services/ideas/report.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ClosureSettingService } from '../../../core/services/closure-setting.service';

@Component({
  selector: 'app-idea-deatil',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './idea-deatil.component.html',
  styleUrl: './idea-deatil.component.scss'
})
export class IdeaDeatilComponent implements OnInit {
  userName = '';
  currentStaffID = 0;
  userRole = '';
  ideaId: number | null = null;

  idea: IdeaModel | null = null;
  comments: CommentModel[] = [];

  newCommentText: string = '';
  isAnonymousComment: boolean = false;

  // --- Menu & Report Variables ---
  showIdeaMenu: boolean = false;
  displayReportModal: boolean = false;
  reportType: 'idea' | 'comment' = 'idea';
  reportTargetId: number | null = null;
  reportReason: string = '';
  isSubmittingReport: boolean = false;
  canModifyIdea: boolean = false;

  isFinalClosurePassed: boolean = false;
  editingCommentId: number | null = null;
  canSeeAnonymous: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private ideaService: IdeaService,
    private commentService: CommentService,
    private voteService: VoteService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private reportService: ReportService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private closureService: ClosureSettingService
  ) { }

  ngOnInit(): void {
    this.userRole = this.cookieService.get('roleName') || 'Guest';
    this.userName = this.cookieService.get('staffName') || 'Guest';
    
    const staffIDStr = this.cookieService.get('staffID');
    this.currentStaffID = staffIDStr ? Number(staffIDStr) : 1;

    const authorizedRoles = ['Administrator', 'QA Manager', 'QA Coordinator'];
    this.canSeeAnonymous = authorizedRoles.includes(this.userRole);

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.ideaId = Number(id);
        this.loadIdeaDetails();
      }
    });
  }

  // --- Menu Handling ---
  toggleIdeaMenu(event: Event): void {
    event.stopPropagation();
    this.showIdeaMenu = !this.showIdeaMenu;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.showIdeaMenu = false; // Close menu when clicking outside
  }

  // --- Download Zip Logic (Placeholder) ---
  downloadIdeaAsZip(): void {
    // Ensure we have a closure setting ID linked to this idea
    const settingID = this.idea?.settingID;

    if (!settingID) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not Available',
        detail: 'This idea is not associated with an academic year closure.'
      });
      return;
    }

    this.showIdeaMenu = false;
    this.messageService.add({ severity: 'info', summary: 'Downloading', detail: 'Preparing your ZIP file...' });

    // Call the service method
    this.closureService.downloadZip(settingID).subscribe({
      next: (res) => {
        if (res.success && res.data.downloadUrl) {
          // Trigger the browser download
          window.location.href = res.data.downloadUrl;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Download started.' });
        }
      },
      error: (err) => {
        // Handle cases where closure date hasn't passed or no files exist
        const errorMsg = err.error.message || 'Failed to download documents.';
        this.messageService.add({ severity: 'error', summary: 'Download Failed', detail: errorMsg });
      }
    });
  }
  // --- Report Logic ---
  openReportModal(type: 'idea' | 'comment', id: number | undefined): void {
    if (!id) return;
    this.reportType = type;
    this.reportTargetId = id;
    this.reportReason = '';
    this.displayReportModal = true;
    this.showIdeaMenu = false; // close the dropdown menu
  }

  submitReport(): void {
    if (!this.reportReason.trim() || !this.reportTargetId) return;

    this.isSubmittingReport = true;

    const payload = {
      report_type: this.reportType,
      reason: this.reportReason,
      reporter_id: this.currentStaffID,
      ideaID: this.reportType === 'idea' ? this.reportTargetId : null,
      commentID: this.reportType === 'comment' ? this.reportTargetId : null,
      status: 'pending' // As per your controller default, though it sets it anyway
    };

    this.reportService.create(payload).subscribe({
      next: (res) => {
        this.isSubmittingReport = false;
        this.displayReportModal = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Report Submitted',
          detail: 'Thank you. An admin will review this shortly.'
        });
      },
      error: (err) => {
        this.isSubmittingReport = false;
        console.error('Failed to submit report', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not submit report at this time.'
        });
      }
    });
  }

  loadIdeaDetails(): void {
    if (!this.ideaId) return;

    this.ideaService.getById(this.ideaId).subscribe({
      next: (res) => {
        this.idea = res.data as IdeaModel;
        this.comments = this.idea.comments || [];

        if (this.idea && this.idea.closure_setting) {
          const now = new Date();
          const closureDeadline = new Date(this.idea.closure_setting.closureDate);
          const finalDeadline = new Date(this.idea.closure_setting.finalclosureDate);

          this.isFinalClosurePassed = now > finalDeadline;
          this.canModifyIdea = (this.idea.staffID === this.currentStaffID) && (now < closureDeadline);
        }
      },
      error: (err) => {
        console.error('Failed to load idea', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Idea not found' });
      }
    });
  }

  editIdea(): void {
    // Determine the base path based on role
    let targetPath = '/submit-ideas/share-idea'; // Default for Management roles

    if (this.userRole === 'Staff') {
      targetPath = '/staff-share-idea';
    }

    // Navigate with the editId parameter
    this.router.navigate([targetPath, { editId: this.idea?.ideaID }]);
  }

  deleteOwnIdea(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete your idea? This action cannot be undone.',
      header: 'Delete Confirmation',
      icon: 'pi pi-trash',
      accept: () => {
        this.ideaService.delete(this.idea!.ideaID).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Your idea was removed.' });
            this.goBack(); // Return to feed after deletion
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete idea.' })
        });
      }
    });
  }


  editComment(comment: CommentModel): void {
    this.newCommentText = comment.comment;
    this.isAnonymousComment = !!comment.isAnonymous;
    this.editingCommentId = comment.commentID;

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  deleteComment(comment: CommentModel): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this comment?',
      header: 'Delete Confirmation',
      icon: 'pi pi-trash',
      accept: () => {
        this.commentService.delete(comment.commentID).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Comment removed' });
            this.loadIdeaDetails();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete comment' })
        });
      }
    });
  }

  submitComment(): void {
    if (this.isFinalClosurePassed) {
      this.messageService.add({ severity: 'warn', summary: 'Locked', detail: 'Commenting is disabled after final closure.' });
      return;
    }
    if (!this.newCommentText.trim() || !this.ideaId) return;

    const payload = {
      comment: this.newCommentText,
      isAnonymous: this.isAnonymousComment ? 1 : 0,
      status: 'active',
      ideaID: this.ideaId,
      staffID: this.currentStaffID
    };

    if (this.editingCommentId) {
      // Call update API if in edit mode
      this.commentService.update(this.editingCommentId, payload).subscribe({
        next: () => {
          this.resetCommentForm();
          this.loadIdeaDetails();
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Comment updated' });
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
      });
    } else {
      this.commentService.create(payload).subscribe({
        next: () => {
          this.newCommentText = '';
          this.isAnonymousComment = false;
          this.loadIdeaDetails();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Comment posted' });
        },
        error: (err) => {
          console.error('Failed to post comment', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not post comment' });
        }
      });
    }
  }

  voteIdea(type: 'Like' | 'Unlike'): void {
    if (this.isFinalClosurePassed) {
      this.messageService.add({ severity: 'warn', summary: 'Locked', detail: 'Voting is disabled after final closure.' });
      return;
    }
    if (!this.idea) return;

    const userVote = this.idea.votes?.find(v => v.staffID === this.currentStaffID);

    if (userVote) {
      if (userVote.voteType === type) {
        this.voteService.delete(userVote.voteID).subscribe({
          next: () => this.loadIdeaDetails(),
          error: (err) => console.error('Failed to remove vote', err)
        });
      } else {
        const payload = { voteType: type, staffID: this.currentStaffID, ideaID: this.idea.ideaID };
        this.voteService.update(userVote.voteID, payload).subscribe({
          next: () => this.loadIdeaDetails(),
          error: (err) => console.error('Failed to switch vote', err)
        });
      }
    } else {
      const payload = { voteType: type, staffID: this.currentStaffID, ideaID: this.idea.ideaID };
      this.voteService.store(payload).subscribe({
        next: () => this.loadIdeaDetails(),
        error: (err) => console.error('Failed to store vote', err)
      });
    }
  }

  // --- Helper Methods ---
  getLikesCount(idea: IdeaModel): number {
    return idea.votes?.filter(v => v.voteType === 'Like').length || 0;
  }

  getUnlikesCount(idea: IdeaModel): number {
    return idea.votes?.filter(v => v.voteType === 'Unlike').length || 0;
  }

  getCommentsCount(idea: IdeaModel): number {
    return idea.comments?.length || 0;
  }

  hasUserLiked(idea: IdeaModel): boolean {
    return idea.votes?.some(v => v.staffID === this.currentStaffID && v.voteType === 'Like') || false;
  }

  hasUserUnliked(idea: IdeaModel): boolean {
    return idea.votes?.some(v => v.staffID === this.currentStaffID && v.voteType === 'Unlike') || false;
  }

  getFileName(path: string): string {
    if (!path) return 'Document';
    return path.split('/').pop() || 'Document';
  }

  goBack(): void {
    this.location.back();
  }

  getProfileUrl(profilePath: string | null | undefined): string {
    if (!profilePath) return '';
    if (/^(https?:)?\/\//.test(profilePath)) return profilePath;
    const trimmed = profilePath.replace(/^\/+/, '');
    let base = (environment.base_url ?? '').replace(/\/+$/, '');
    base = base.replace(/\/api$/, '');
    return base ? `${base}/${trimmed}` : `/${trimmed}`;
  }

  getDocUrl(docPath: string): string {
    if (!docPath) return '';
    if (/^(https?:)?\/\//.test(docPath)) return docPath;
    const trimmedPath = docPath.replace(/^\/+/, '');
    let base = (environment.base_url ?? '').replace(/\/+$/, '');
    base = base.replace(/\/api$/, '');
    return `${base}/${trimmedPath}`;
  }

  getFileIcon(path: string): string {
    if (!path) return 'pi-file';
    const ext = path.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') return 'pi-file-pdf';
    if (ext === 'doc' || ext === 'docx') return 'pi-file-word';
    if (ext === 'xls' || ext === 'xlsx') return 'pi-file-excel';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return 'pi-image';

    return 'pi-file';
  }

  getFileColor(path: string): string {
    if (!path) return 'text-gray-500 dark:text-gray-400';
    const ext = path.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') return 'text-red-500 dark:text-red-400';
    if (ext === 'doc' || ext === 'docx') return 'text-blue-500 dark:text-blue-400';
    if (ext === 'xls' || ext === 'xlsx') return 'text-green-500 dark:text-green-400';
    if (ext === 'ppt' || ext === 'pptx') return 'text-orange-500 dark:text-orange-400';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return 'text-purple-500 dark:text-purple-400';

    return 'text-gray-500 dark:text-gray-400';
  }

  private resetCommentForm(): void {
    this.newCommentText = '';
    this.isAnonymousComment = false;
    this.editingCommentId = null;
  }
}