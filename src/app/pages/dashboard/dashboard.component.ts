import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Chart, registerables } from 'chart.js';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DashboardService } from '../../core/services/dashboard.service';
import { environment } from '../../../environments/environment';
import { ClosureSettingService } from '../../core/services/closure-setting.service';
import { AuthService } from '../../core/services/auth.service';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ToastModule, DropdownModule, FormsModule],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // Role & View Management
  userRole: string = '';
  userDepartment: string = '';
  isGlobalView: boolean = true;
  fabOpen: boolean = false;

  // Chart instances
  barChart: Chart | null = null;
  donutChart: Chart | null = null;
  horizontalBarChart: Chart | null = null;
  browserUsageChart: Chart | null = null;
  pagesChart: Chart | null = null;

  // Data Containers
  lastLoginMessage: string = '';
  closureSettings: any[] = [];
  selectedSettingID: number | null = null;
  stats: any[] = [];

  // Dynamic Chart Data Arrays
  departments: string[] = [];
  ideasPerDepartment: number[] = [];
  contributorsPerDepartment: number[] = [];

  months: string[] = [];
  ideasPerMonth: number[] = [];
  contributorsPerMonth: number[] = [];

  categories: string[] = [];
  ideasByCategory: number[] = [];

  mostActiveUsers: any[] = [];
  chartColors = ['#8B5CF6', '#EF4444', '#06B6D4', '#F59E0B', '#F97316', '#22C55E', '#3B82F6', '#EC4899', '#14B8A6', '#FACC15'];

  constructor(
    private cookieService: CookieService,
    private messageService: MessageService,
    private dashboardService: DashboardService,
    private closureService: ClosureSettingService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userRole = this.cookieService.get('roleName') || 'Guest';
    this.userDepartment = this.cookieService.get('departmentName') || 'Unknown Department';
    this.isGlobalView = this.userRole === 'Administrator';

    this.loadClosureSettings();
    this.setLastLoginMessage();

    if (this.userRole === 'Administrator') {
      this.loadSystemUsageData();
    }
  }

  ngAfterViewInit(): void {
    // Initial chart render is handled inside loadDashboardData after API returns
  }

  private destroyMainCharts(): void {
    this.barChart?.destroy();
    this.donutChart?.destroy();
    this.horizontalBarChart?.destroy();
  }

  // Targeted cleanup for System Monitoring data
  private destroyMonitoringCharts(): void {
    this.browserUsageChart?.destroy();
    this.pagesChart?.destroy();
  }

  // Update the global OnDestroy to use both
  ngOnDestroy(): void {
    this.destroyMainCharts();
    this.destroyMonitoringCharts();
  }

  loadClosureSettings(): void {
    this.closureService.get().subscribe({
      next: (res) => {
        this.closureSettings = res.data;
        if (this.closureSettings.length > 0) {
          // Default to the first (latest) academic year
          this.selectedSettingID = this.closureSettings[0].settingID;
          this.loadDashboardData();
        }
      },
      error: (err) => console.error('Failed to load closure settings', err)
    });
  }

  onYearChange(event: any): void {
    this.selectedSettingID = event.value;
    this.loadDashboardData();
    this.fabOpen = false;
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardStats(this.selectedSettingID).subscribe({
      next: (res) => {
        const data = res.data;

        // 1. Map Top Stats Cards
        this.stats = [
          { label: 'Total Ideas', value: data.topStats.totalIdeas },
          { label: 'Total Contributors', value: data.topStats.totalContributors },
          { label: 'Anonymous Ideas', value: data.topStats.anonymousIdeas },
          { label: 'Ideas without Cmts', value: data.topStats.ideasWithoutComments },
        ];

        // 2. Map Dynamic Chart Data based on Role View
        if (this.isGlobalView) {
          this.departments = data.ideasByDepartment.map((d: any) => d.departmentName);
          this.ideasPerDepartment = data.ideasByDepartment.map((d: any) => d.count);
          // Global uses contributor counts by month for the horizontal chart
          this.months = data.contributorTrends.map((c: any) => c.month);
          this.contributorsPerMonth = data.contributorTrends.map((c: any) => c.count);
        } else {
          // Department/Coordinator View
          this.months = data.ideasByMonth.map((m: any) => m.month);
          this.ideasPerMonth = data.ideasByMonth.map((m: any) => m.count);
          this.categories = data.ideasByCategory.map((c: any) => c.categoryname);
          this.ideasByCategory = data.ideasByCategory.map((c: any) => c.count);
          this.contributorsPerMonth = data.contributorTrends.map((c: any) => c.count);
        }

        this.refreshVisuals();
      },
      error: (err) => console.error('Error fetching dashboard stats', err)
    });
  }

  refreshVisuals(): void {
    this.destroyMainCharts();

    setTimeout(() => {
      this.initBarChart();
      this.initDonutChart();
      this.initHorizontalBarChart();
    }, 100);
  }

  loadSystemUsageData(): void {
    this.dashboardService.getUsageStats().subscribe({
      next: (res) => {
        const data = res.data;
        this.mostActiveUsers = data.mostActiveUsers;

        // Ensure monitoring charts are cleaned before re-init
        this.destroyMonitoringCharts();

        // Use a slight timeout to ensure canvases are rendered in the DOM
        setTimeout(() => {
          this.initPagesChart(data.mostViewedPages);
          this.initBrowserChart(data.browserUsage);
        }, 150);
      },
      error: (err) => console.error('Failed to load usage stats', err)
    });
  }

  // --- Chart Initializations ---

  private initBarChart(): void {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas) return;

    const chartLabels = this.isGlobalView ? this.departments : this.months;
    const chartData = this.isGlobalView ? this.ideasPerDepartment : this.ideasPerMonth;
    const chartTitle = this.isGlobalView ? 'Number of Ideas per Department' : 'Submission Trends (Ideas per Month)';

    this.barChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Number of Ideas',
          data: chartData,
          backgroundColor: this.isGlobalView ? 'rgba(136, 212, 171, 0.8)' : 'rgba(59, 130, 246, 0.8)',
          borderRadius: 8
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: chartTitle } } }
    });
  }

  private initDonutChart(): void {
    const canvas = document.getElementById('donutChart') as HTMLCanvasElement;
    if (!canvas) return;

    const chartLabels = this.isGlobalView ? this.departments : this.categories;
    const chartData = this.isGlobalView ? this.ideasPerDepartment : this.ideasByCategory;
    const chartTitle = this.isGlobalView ? 'Idea Distribution by Department' : 'Idea Distribution by Category';

    this.donutChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartData,
          backgroundColor: this.chartColors
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: chartTitle } } }
    });
  }

  private initHorizontalBarChart(): void {
    const canvas = document.getElementById('horizontalBarChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.horizontalBarChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.months,
        datasets: [{
          label: 'Unique Contributors',
          data: this.contributorsPerMonth,
          backgroundColor: 'rgba(234, 179, 8, 0.8)',
          borderRadius: 8
        }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Contributor Trends per Month' } } }
    });
  }

  private initPagesChart(pages: any[]): void {
    const ctx = document.getElementById('pagesChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.pagesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: pages.map(p => p.url),
        datasets: [{ label: 'Views', data: pages.map(p => p.views), backgroundColor: '#6FCBF0' }]
      },
      options: { indexAxis: 'y', responsive: true, plugins: { title: { display: true, text: 'Most Viewed Pages' } } }
    });
  }

  private initBrowserChart(browsers: any[]): void {
    const ctx = document.getElementById('browserChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.browserUsageChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: browsers.map(b => b.browser || 'Unknown'),
        datasets: [{ data: browsers.map(b => b.count), backgroundColor: ['#8B5CF6', '#EF4444', '#10B981'] }]
      },
      options: { responsive: true, plugins: { title: { display: true, text: 'Browser Usage' } } }
    });
  }

  // --- Helper Methods ---

  exportData(format: 'csv' | 'pdf'): void {
    if (!this.selectedSettingID) return;

    this.closureService.exportIdeas(this.selectedSettingID, format).subscribe({
      next: (res) => {
        if (res.success && res.data.downloadUrl) {
          // Create a temporary anchor element
          const link = document.createElement('a');
          link.href = res.data.downloadUrl;

          // The 'download' attribute forces the browser to download instead of open
          const fileName = res.data.downloadUrl.split('/').pop() || `export.${format}`;
          link.setAttribute('download', fileName);

          // For PDF safety, also set target to _blank so if it does open, it's a new tab
          link.target = '_blank';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Download started' });
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: err.error.message || 'Download restricted until after closure date.'
        });
      }
    });
  }

  getProfileUrl(profilePath: string | null | undefined): string {
    if (!profilePath) return '';
    const trimmed = profilePath.replace(/^\/+/, '');
    return `${environment.main_url.replace(/\/api$/, '')}/${trimmed}`;
  }

  setLastLoginMessage(): void {
    const shouldShow = sessionStorage.getItem('showLoginReminder');
    if (shouldShow !== 'true') return;

    const prevLogin = this.cookieService.get('previousLoginAt');
    if (!prevLogin || prevLogin === 'first_login') {
      this.lastLoginMessage = 'Welcome! This is your first time logging into the system.';
    } else {
      const datePipe = new DatePipe('en-US');
      // Direct Wall-clock time display as per your preference
      const rawTime = prevLogin.split('.')[0].replace('T', ' ');
      const formattedDate = datePipe.transform(rawTime, 'medium');
      this.lastLoginMessage = `Security Reminder: Your last login was on ${formattedDate}.`;
    }
    sessionStorage.removeItem('showLoginReminder');
  }

  downloadZip(): void {
    if (this.userRole !== 'QA Manager' || !this.selectedSettingID) return;

    this.messageService.add({ severity: 'info', summary: 'Processing', detail: 'Creating ZIP file...' });

    this.dashboardService.downloadAllDocuments(this.selectedSettingID).subscribe({
      next: (res) => {
        if (res.success && res.data.downloadUrl) {
          window.location.href = res.data.downloadUrl; // Triggers browser download
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: err.error.message || 'Download restricted until after closure date.'
        });
      }
    });
  }

  toggleFab(): void {
    this.fabOpen = !this.fabOpen;
  }


}