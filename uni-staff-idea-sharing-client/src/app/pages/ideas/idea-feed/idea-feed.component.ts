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
  imports: [CommonModule, FormsModule, SelectModule, DropdownModule, RouterLink],
  templateUrl: './idea-feed.component.html',
  styleUrl: './idea-feed.component.scss'
})
export class IdeaFeedComponent implements OnInit {
  userName: string = 'William';
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
    const staffID = this.cookieService.get('staffID');
    this.name = name;
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

        this.ideas = fetchedIdeas.map(idea => {
          idea.likesCount = idea.votes?.filter(v => v.voteType === 'Like').length || 0;
          idea.unlikesCount = idea.votes?.filter(v => v.voteType === 'Unlike').length || 0;
          idea.commentsCount = idea.comments?.length || 0;
          idea.viewsCount = 0; // Requires backend implementation for real views

          return idea;
        });

        this.applyFilters();
      },
      error: (err) => console.error('Error fetching ideas:', err)
    });
  }

  // --- API Call for Voting ---
  vote(idea: IdeaModel, type: 'Like' | 'Unlike'): void {
    const payload = {
      voteType: type,
      staffID: this.staffID,
      ideaID: idea.ideaID
    };

    this.voteService.store(payload).subscribe({
      next: (res) => {
        console.log(`${type} recorded successfully!`);
        this.loadIdeas(); // Reload ideas to get the updated vote counts
      },
      error: (err) => {
        // Handle 409 Conflict if they already voted
        if (err.status === 409) {
          alert('You have already voted on this idea.');
        } else {
          console.error('Voting failed:', err);
        }
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.ideas];

    // Search filter
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
        (idea.staff as any)?.departmentID == this.selectedDept
      );
    }

    switch (this.activeFilter) {
      case 'Popular':
        // Sort by highest likes
        result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        break;
      case 'Latest':
        // Sort by created_at (newest first)
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'Most Viewed':
        // Sort by views (if implemented in backend)
        result.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
        break;
      case 'All':
      default:
        // Default sort (e.g., by ID descending)
        result.sort((a, b) => b.ideaID - a.ideaID);
        break;
    }

    this.filteredIdeas = result;
  }

  toggleMenu(ideaID: number, event: Event): void {
    event.stopPropagation(); // Prevent the document click listener from immediately closing it
    this.activeMenuId = this.activeMenuId === ideaID ? null : ideaID;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    // Close the menu if the user clicks anywhere else on the page
    this.activeMenuId = null;
  }

  removeIdea(idea: IdeaModel): void {
    console.log('Remove idea logic here for idea:', idea.ideaID);
    this.activeMenuId = null; // Close menu after action
    // Call this.ideaService.delete(idea.ideaID)...
  }

  hideIdea(idea: IdeaModel): void {
    console.log('Hide idea logic here for idea:', idea.ideaID);
    this.activeMenuId = null; // Close menu after action
  }

  goToShareIdea(): void {
    this.router.navigate(['submit-ideas/share-idea']);
  }

  getProfileUrl(profilePath: string | null | undefined): string {
    if (!profilePath) return '';
    if (/^(https?:)?\/\//.test(profilePath)) return profilePath;
    const trimmed = profilePath.replace(/^\/+/, '');
    let base = (environment.main_url ?? '').replace(/\/+$/, '');
    base = base.replace(/\/api$/, ''); // strip accidental "/api"
    return base ? `${base}/${trimmed}` : `/${trimmed}`;
  }
}