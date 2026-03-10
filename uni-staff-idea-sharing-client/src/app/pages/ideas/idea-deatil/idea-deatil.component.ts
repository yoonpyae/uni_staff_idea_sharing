import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../../environments/environment';
import { IdeaModel } from '../../../core/models/ideas/idea.model';
import { CommentService } from '../../../core/services/ideas/comment.service';
import { IdeaService } from '../../../core/services/ideas/idea.service';
import { VoteService } from '../../../core/services/ideas/vote.service';
import { CommentModel } from '../../../core/models/ideas/comment.model';

@Component({
  selector: 'app-idea-deatil',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './idea-deatil.component.html',
  styleUrl: './idea-deatil.component.scss'
})
export class IdeaDeatilComponent implements OnInit {
  userName = '';
  currentStaffID = 0;
  ideaId: number | null = null;

  idea: IdeaModel | null = null;
  comments: CommentModel[] = [];

  // Comment Form State
  newCommentText: string = '';
  isAnonymousComment: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private ideaService: IdeaService,
    private commentService: CommentService,
    private voteService: VoteService,
    private cookieService: CookieService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.userName = this.cookieService.get('staffName') || 'Guest';
    const staffIDStr = this.cookieService.get('staffID');
    this.currentStaffID = staffIDStr ? Number(staffIDStr) : 1;

    // Get the Idea ID from the URL
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.ideaId = Number(id);
        this.loadIdeaDetails();
      }
    });
  }

  loadIdeaDetails(): void {
    if (!this.ideaId) return;

    this.ideaService.getById(this.ideaId).subscribe({
      next: (res) => {
        this.idea = res.data as IdeaModel;

        // Calculate counts
        this.idea.likesCount = this.idea.votes?.filter(v => v.voteType === 'Like').length || 0;
        this.idea.unlikesCount = this.idea.votes?.filter(v => v.voteType === 'Unlike').length || 0;
        this.idea.viewsCount = 120; // Mock views

        this.loadComments();
      },
      error: (err) => {
        console.error('Failed to load idea', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Idea not found' });
      }
    });
  }

  loadComments(): void {
    this.commentService.get().subscribe({
      next: (res) => {
        const allComments = res.data as any[];
        this.comments = allComments.filter(c => c.ideaID === this.ideaId);
        if (this.idea) {
          this.idea.commentsCount = this.comments.length;
        }
      },
      error: (err) => console.error('Failed to load comments', err)
    });
  }

  submitComment(): void {
    if (!this.newCommentText.trim() || !this.ideaId) return;

    const payload = {
      comment: this.newCommentText,
      isAnonymous: this.isAnonymousComment,
      ideaID: this.ideaId,
      staffID: this.currentStaffID
    };

    this.commentService.create(payload).subscribe({
      next: () => {
        this.newCommentText = '';
        this.isAnonymousComment = false;
        this.loadComments(); // Refresh comments list
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Comment posted' });
      },
      error: (err) => {
        console.error('Failed to post comment', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not post comment' });
      }
    });
  }

  voteIdea(type: 'Like' | 'Unlike'): void {
    if (!this.idea) return;
    const payload = { voteType: type, staffID: this.currentStaffID, ideaID: this.idea.ideaID };

    this.voteService.store(payload).subscribe({
      next: () => this.loadIdeaDetails(), // Reload to update counts
      error: (err) => {
        if (err.status === 409) this.messageService.add({ severity: 'warn', summary: 'Voted', detail: 'Already voted' });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  getProfileUrl(profilePath: string | null | undefined): string {
    if (!profilePath) return '';
    if (/^(https?:)?\/\//.test(profilePath)) return profilePath;
    const trimmed = profilePath.replace(/^\/+/, '');
    let base = (environment.main_url ?? '').replace(/\/+$/, '');
    base = base.replace(/\/api$/, '');
    return base ? `${base}/${trimmed}` : `/${trimmed}`;
  }
}