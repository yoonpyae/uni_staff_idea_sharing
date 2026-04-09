import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { IdeaModel } from '../../../core/models/ideas/idea.model';
import { IdeaService } from '../../../core/services/ideas/idea.service';
import { CookieService } from 'ngx-cookie-service';
import { DepartmentModel } from '../../../core/models/department.model';
import { CategoryModel } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { DepartmentService } from '../../../core/services/department.service';
import { VoteService } from '../../../core/services/ideas/vote.service';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ThemeService } from '../../../core/services/themeService';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { ReportService } from '../../../core/services/ideas/report.service';

@Component({
  selector: 'app-staff-idea-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, DropdownModule, RouterLink],
  templateUrl: './staff-idea-feed.component.html',
  styleUrl: './staff-idea-feed.component.scss'
})
export class StaffIdeaFeedComponent implements OnInit {
  searchQuery: string = '';
  activeFilter: string = 'All';

  ideas: IdeaModel[] = [];
  filteredIdeas: IdeaModel[] = [];
  name = '';
  staffID = 0;

  profilePictureUrl: string = '';
  showProfileMenu: boolean = false;

  departments: { label: string, value: number | null }[] = [{ label: 'All Departments', value: null }];
  categories: { label: string, value: number | null }[] = [{ label: 'All Categories', value: null }];

  selectedDept: number | null = null;
  selectedCat: number | null = null;
  activeMenuId: number | null = null;

  displayReportModal: boolean = false;
  reportType: 'idea' | 'comment' = 'idea';
  reportTargetId: number | null = null;
  reportReason: string = '';

  isSubmittingReport: boolean = false;

  isDeptLimitReached: boolean = false;
  userDeptID: number = 0;

  constructor(
    private ideaService: IdeaService,
    private cookieService: CookieService,
    private departmentService: DepartmentService,
    private categoryService: CategoryService,
    private voteService: VoteService,
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService,
    private messageService: MessageService,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    const name = this.cookieService.get('staffName') || 'Guest';
    const staffIDStr = this.cookieService.get('staffID');

    // Process Profile Picture
    const profilePictureEncoded = this.cookieService.get('staffProfile') || '';
    const rawPic = profilePictureEncoded ? decodeURIComponent(profilePictureEncoded) : '';
    if (rawPic) {
      if (rawPic.startsWith('http') || rawPic.startsWith('data:')) {
        this.profilePictureUrl = rawPic;
      } else {
        const parts = rawPic.split('/').filter(Boolean);
        const basename = parts.length ? parts[parts.length - 1] : rawPic;
        this.profilePictureUrl = `${environment.base_url?.replace(/\/$/, '')}/uploads/staff_profiles/${basename}`;
      }
    }

    this.name = name;
    this.staffID = staffIDStr ? Number(staffIDStr) : 0;

    const deptIDStr = this.cookieService.get('departmentID');
    this.userDeptID = deptIDStr ? Number(deptIDStr) : 0;

    this.loadIdeas();
    this.loadDepartments();
    this.loadCategories();
  }

  // --- THEME & AUTH LOGIC ---
  setTheme(toDark: boolean) {
    if (toDark !== this.themeService.isDark()) {
      this.themeService.toggleTheme();
    }
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
  }

  // --- DATA LOADING & FILTERING ---
  loadDepartments(): void {
    this.departmentService.get().subscribe({
      next: (res) => {
        const depts = res.data as DepartmentModel[];
        const mappedDepts = depts.map(d => ({ label: d.departmentName, value: d.departmentID }));
        this.departments = [{ label: 'All Departments', value: null }, ...mappedDepts];
      }
    });
  }

  loadCategories(): void {
    this.categoryService.get().subscribe({
      next: (res) => {
        const cats = res.data as CategoryModel[];
        const mappedCats = cats.map(c => ({ label: c.categoryname, value: c.categoryID }));
        this.categories = [{ label: 'All Categories', value: null }, ...mappedCats];
      }
    });
  }

  loadIdeas(): void {
    this.ideaService.get().subscribe({
      next: (res) => {
        const fetchedIdeas = res.data as IdeaModel[];
        this.ideas = fetchedIdeas.filter(idea => idea.status === 'approved');
        this.isDeptLimitReached = fetchedIdeas.some(idea =>
          idea.staff?.departmentID === this.userDeptID &&
          idea.status !== 'deleted'
        );

        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    let result = [...this.ideas];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(idea =>
        idea.title.toLowerCase().includes(q) || idea.description.toLowerCase().includes(q)
      );
    }
    if (this.selectedCat) result = result.filter(idea => idea.categories?.some(c => c.categoryID == this.selectedCat));
    if (this.selectedDept) result = result.filter(idea => idea.staff?.departmentID == this.selectedDept);

    switch (this.activeFilter) {
      case 'Popular': result.sort((a, b) => this.getLikesCount(b) - this.getLikesCount(a)); break;
      case 'Latest': result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()); break;
      case 'Most Viewed': result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)); break;
      default: result.sort((a, b) => b.ideaID - a.ideaID); break;
    }
    this.filteredIdeas = result;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  // --- INTERACTIONS ---
  vote(idea: IdeaModel, type: 'Like' | 'Unlike'): void {
    if (this.isFinalClosurePassed(idea)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Locked',
        detail: 'Voting is disabled as the final closure date has passed.'
      });
      return;
    }

    const userVote = idea.votes?.find(v => v.staffID === this.staffID);
    if (userVote) {
      if (userVote.voteType === type) {
        this.voteService.delete(userVote.voteID).subscribe({ next: () => this.loadIdeas() });
      } else {
        this.voteService.update(userVote.voteID, { voteType: type, staffID: this.staffID, ideaID: idea.ideaID }).subscribe({ next: () => this.loadIdeas() });
      }
    } else {
      this.voteService.store({ voteType: type, staffID: this.staffID, ideaID: idea.ideaID }).subscribe({ next: () => this.loadIdeas() });
    }
  }

  goToIdeaDetail(idea: IdeaModel): void {
    this.ideaService.increaseViewCount(idea.ideaID).subscribe({
      next: () => this.router.navigate(['/staff-idea-detail', idea.ideaID]),
      error: () => this.router.navigate(['/staff-idea-detail', idea.ideaID])
    });
  }

  goToShareIdea(): void {
    this.router.navigate(['/staff-share-idea']);
  }

  // --- HELPERS ---
  getLikesCount(idea: IdeaModel): number { return idea.votes?.filter(v => v.voteType === 'Like').length || 0; }
  getUnlikesCount(idea: IdeaModel): number { return idea.votes?.filter(v => v.voteType === 'Unlike').length || 0; }
  getCommentsCount(idea: IdeaModel): number { return idea.comments?.length || 0; }
  hasUserLiked(idea: IdeaModel): boolean { return idea.votes?.some(v => v.staffID === this.staffID && v.voteType === 'Like') || false; }
  hasUserUnliked(idea: IdeaModel): boolean { return idea.votes?.some(v => v.staffID === this.staffID && v.voteType === 'Unlike') || false; }

  getFileName(path: string): string {
    if (!path) return 'Document';
    return path.split('/').pop() || 'Document';
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

  toggleMenu(ideaID: number, event: Event): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === ideaID ? null : ideaID;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.activeMenuId = null;
    this.showProfileMenu = false; // Close profile menu on outside click
  }

  getProfileUrl(profilePath: string | null | undefined): string {
    if (!profilePath) return '';
    if (/^(https?:)?\/\//.test(profilePath)) return profilePath;
    const trimmed = profilePath.replace(/^\/+/, '');
    return `${environment.base_url.replace(/\/api$/, '')}/${trimmed}`;
  }

  getDocUrl(docPath: string): string {
    if (!docPath) return '';
    if (/^(https?:)?\/\//.test(docPath)) return docPath;
    const trimmedPath = docPath.replace(/^\/+/, '');
    let base = (environment.base_url ?? '').replace(/\/+$/, '');
    base = base.replace(/\/api$/, '');
    return `${base}/${trimmedPath}`;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (res: any) => {
        // show backend message if present
        if (res && res.message) {
          this.messageService.add({
            severity: res.success ? 'success' : 'info',
            summary: res.success ? 'Logged out' : 'Notice',
            detail: res.message,
            key: environment.default_toastKey
          });
        }

        this.authService.logoutForce();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const detail = err?.error?.message || err?.message || 'Logout failed';
        this.messageService.add({
          severity: 'error',
          summary: 'Logout Failed',
          detail,
          key: environment.default_toastKey
        });
        console.error('Logout failed:', err);
        this.authService.logoutForce(); // fallback
        this.router.navigate(['/login']);
      }
    });
  }

  // --- Report Logic ---
  openReportModal(ideaID: number, event: Event): void {
    event.stopPropagation();
    this.reportType = 'idea';
    this.reportTargetId = ideaID;
    this.reportReason = '';
    this.displayReportModal = true;
    this.activeMenuId = null; // Close the dropdown menu
  }

  submitReport(): void {
    if (!this.reportReason.trim() || !this.reportTargetId) return;

    this.isSubmittingReport = true;

    const payload = {
      report_type: this.reportType,
      reason: this.reportReason,
      reporter_id: this.staffID,
      ideaID: this.reportTargetId,
      commentID: null,
      status: 'pending'
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

  isFinalClosurePassed(idea: IdeaModel): boolean {
    if (idea && idea.closure_setting) {
      const now = new Date();
      // Your API returns a single object for closure_setting
      const finalDeadline = new Date(idea.closure_setting.finalclosureDate);
      return now > finalDeadline;
    }
    return false;
  }
}