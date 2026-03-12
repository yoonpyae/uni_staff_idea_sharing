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

@Component({
  selector: 'app-idea-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, DropdownModule],
  templateUrl: './idea-feed.component.html',
  styleUrl: './idea-feed.component.scss'
})
export class IdeaFeedComponent implements OnInit {
  userName: string = 'Guest';
  searchQuery: string = '';
  activeFilter: string = 'All';

  ideas: IdeaModel[] = [];
  filteredIdeas: IdeaModel[] = [];
  name = '';
  staffID = 0;

  departments: { label: string, value: number | null }[] = [{ label: 'All Departments', value: null }];
  categories: { label: string, value: number | null }[] = [{ label: 'All Categories', value: null }];

  selectedDept: number | null = null;
  selectedCat: number | null = null;

  activeMenuId: number | null = null;

  constructor(
    private ideaService: IdeaService,
    private cookieService: CookieService,
    private departmentService: DepartmentService,
    private categoryService: CategoryService,
    private voteService: VoteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const name = this.cookieService.get('staffName') || 'Guest';
    const staffIDStr = this.cookieService.get('staffID');

    this.name = name;
    this.staffID = staffIDStr ? Number(staffIDStr) : 0;

    this.loadIdeas();
    this.loadDepartments();
    this.loadCategories();
  }

  loadDepartments(): void {
    this.departmentService.get().subscribe({
      next: (res) => {
        const depts = res.data as DepartmentModel[];
        const mappedDepts = depts.map(d => ({ label: d.departmentName, value: d.departmentID }));
        this.departments = [{ label: 'All Departments', value: null }, ...mappedDepts];
      },
      error: (err) => console.error('Failed to load departments', err)
    });
  }

  loadCategories(): void {
    this.categoryService.get().subscribe({
      next: (res) => {
        const cats = res.data as CategoryModel[];
        const mappedCats = cats.map(c => ({ label: c.categoryname, value: c.categoryID }));
        this.categories = [{ label: 'All Categories', value: null }, ...mappedCats];
      },
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  loadIdeas(): void {
    this.ideaService.get().subscribe({
      next: (res) => {
        const fetchedIdeas = res.data as IdeaModel[];

        this.ideas = fetchedIdeas.filter(idea => idea.status === 'approved');

        this.applyFilters();
      },
      error: (err) => console.error('Error fetching ideas:', err)
    });
  }


  vote(idea: IdeaModel, type: 'Like' | 'Unlike'): void {
    const userVote = idea.votes?.find(v => v.staffID === this.staffID);

    if (userVote) {
      if (userVote.voteType === type) {
        this.voteService.delete(userVote.voteID).subscribe({
          next: () => this.loadIdeas(),
          error: (err) => console.error('Failed to remove vote', err)
        });
      } else {
        const payload = { voteType: type, staffID: this.staffID, ideaID: idea.ideaID };
        this.voteService.update(userVote.voteID, payload).subscribe({
          next: () => this.loadIdeas(),
          error: (err) => console.error('Failed to switch vote', err)
        });
      }
    } else {
      const payload = { voteType: type, staffID: this.staffID, ideaID: idea.ideaID };
      this.voteService.store(payload).subscribe({
        next: () => this.loadIdeas(),
        error: (err) => console.error('Failed to store vote', err)
      });
    }
  }

  // Helper methods to check active UI state
  hasUserLiked(idea: IdeaModel): boolean {
    return idea.votes?.some(v => v.staffID === this.staffID && v.voteType === 'Like') || false;
  }

  hasUserUnliked(idea: IdeaModel): boolean {
    return idea.votes?.some(v => v.staffID === this.staffID && v.voteType === 'Unlike') || false;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.ideas];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(idea =>
        idea.title.toLowerCase().includes(q) ||
        idea.description.toLowerCase().includes(q)
      );
    }

    if (this.selectedCat) {
      result = result.filter(idea =>
        idea.categories?.some(c => c.categoryID == this.selectedCat)
      );
    }

    if (this.selectedDept) {
      result = result.filter(idea =>
        idea.staff?.departmentID == this.selectedDept
      );
    }

    switch (this.activeFilter) {
      case 'Popular':
        result.sort((a, b) => this.getLikesCount(b) - this.getLikesCount(a));
        break;
      case 'Latest':
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'Most Viewed':
        result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'All':
      default:
        result.sort((a, b) => b.ideaID - a.ideaID);
        break;
    }

    this.filteredIdeas = result;
  }

  goToIdeaDetail(idea: IdeaModel): void {
    this.ideaService.increaseViewCount(idea.ideaID).subscribe({
      next: () => this.router.navigate(['/submit-ideas/idea-detail', idea.ideaID]),
      error: () => this.router.navigate(['/submit-ideas/idea-detail', idea.ideaID])
    });
  }

  getLikesCount(idea: IdeaModel): number {
    return idea.votes?.filter(v => v.voteType === 'Like').length || 0;
  }

  getUnlikesCount(idea: IdeaModel): number {
    return idea.votes?.filter(v => v.voteType === 'Unlike').length || 0;
  }

  getCommentsCount(idea: IdeaModel): number {
    return idea.comments?.length || 0;
  }

  // --- Helper Methods ---

  getFileName(path: string): string {
    if (!path) return 'Document';
    return path.split('/').pop() || 'Document';
  }

  toggleMenu(ideaID: number, event: Event): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === ideaID ? null : ideaID;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.activeMenuId = null;
  }

  removeIdea(idea: IdeaModel): void {
    this.ideaService.delete(idea.ideaID).subscribe({
      next: () => this.loadIdeas(),
      error: (err) => console.error('Failed to delete idea', err)
    });
    this.activeMenuId = null;
  }

  hideIdea(idea: IdeaModel): void {
    this.activeMenuId = null;
  }

  goToShareIdea(): void {
    this.router.navigate(['submit-ideas/share-idea']);
  }

  getProfileUrl(profilePath: string | null | undefined): string {
    if (!profilePath) return '';
    if (/^(https?:)?\/\//.test(profilePath)) return profilePath;
    const trimmed = profilePath.replace(/^\/+/, '');
    let base = (environment.main_url ?? '').replace(/\/+$/, '');
    base = base.replace(/\/api$/, '');
    return base ? `${base}/${trimmed}` : `/${trimmed}`;
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
}