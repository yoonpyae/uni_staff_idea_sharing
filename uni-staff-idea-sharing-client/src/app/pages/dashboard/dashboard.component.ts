import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Chart, registerables } from 'chart.js';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DashboardService } from '../../core/services/dashboard.service';
import { environment } from '../../../environments/environment';
import { ClosureSettingService } from '../../core/services/closure-setting.service';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ToastModule],
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
  currentYear = new Date().getFullYear();
  selectedYear = this.currentYear;

  // Role & View Management
  userRole: string = '';
  userDepartment: string = '';
  isGlobalView: boolean = true;

  // Charts
  barChart: Chart | null = null;
  donutChart: Chart | null = null;
  horizontalBarChart: Chart | null = null;


  closureSettings: any[] = [];
  selectedSettingID: number | null = null;

  stats: any[] = [];
  years = [this.currentYear, this.currentYear - 1, this.currentYear - 2];
  chartColors = ['#8B5CF6', '#EF4444', '#06B6D4', '#F59E0B', '#F97316', '#22C55E', '#3B82F6', '#EC4899', '#14B8A6', '#FACC15'];

  // --- MOCK DATA: GLOBAL VIEW (Admin / QA Manager) ---
  departments = ['Dep 1', 'Dep 2', 'Dep 3', 'Dep 4', 'Dep 5', 'Dep 6', 'Dep 7', 'Dep 8', 'Dep 9', 'Dep 10'];
  ideasPerDepartment = [55, 25, 32, 12, 28, 45, 92, 27, 75, 18];
  contributorsPerDepartment = [38, 42, 26, 12, 48, 35, 24, 12, 36, 44];

  // --- MOCK DATA: DEPARTMENT VIEW (QA Coordinator) ---
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  ideasPerMonth = [3, 2, 2, 3, 2, 4, 1, 0, 3, 2, 0, 5];
  contributorsPerMonth = [3, 1, 2, 2, 1, 2, 1, 0, 2, 1, 0, 3];
  categories = ['Infrastructure', 'Staff Welfare', 'Digital Transform', 'Student Exp', 'Workload', 'Internal Comm', 'Health & Safety', 'Data Protection'];
  ideasByCategory = [3, 19, 9, 11, 16, 23, 13, 6];

  mostViewedPages: any[] = [];
  mostActiveUsers: any[] = [];
  browserUsageChart: Chart | null = null;
  pagesChart: Chart | null = null;

  constructor(
    private cookieService: CookieService,
    private messageService: MessageService,
    private dashboardService: DashboardService,
    private closureService: ClosureSettingService
  ) { }

  ngOnInit(): void {
    this.userRole = this.cookieService.get('roleName') || 'Guest';
    this.userDepartment = this.cookieService.get('departmentName') || 'Social Studies Department';
    this.loadClosureSettings();
    this.isGlobalView = this.userRole === 'Administrator';

    if (this.isGlobalView) {
      this.loadSystemUsageData();
    }

    // Determine if user sees global stats or department stats
    if (this.userRole === 'Administrator') {
      this.isGlobalView = true;
    } else {
      this.isGlobalView = false;
    }

    // Set stats cards based on role
    if (this.isGlobalView) {
      this.stats = [
        { label: 'Total Ideas', value: 250 },
        { label: 'Total Contributors', value: 150 },
        { label: 'Anonymous Ideas', value: 66 },
        { label: 'Ideas without Cmts', value: 25 },
      ];
    } else {
      this.stats = [
        { label: 'Total Ideas', value: 27 },
        { label: 'Total Contributors', value: 18 },
        { label: 'Anonymous Ideas', value: 4 },
        { label: 'Ideas without Cmts', value: 6 },
      ];
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initBarChart();
      this.initDonutChart();
      this.initHorizontalBarChart();
    }, 100);
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.donutChart?.destroy();
    this.horizontalBarChart?.destroy();
  }

  loadClosureSettings(): void {
    this.closureService.get().subscribe({
      next: (res) => {
        // Store the actual closure setting records
        this.closureSettings = res.data;

        if (this.closureSettings.length > 0) {
          // Default to the first available setting
          this.selectedSettingID = this.closureSettings[0].settingID;
          this.selectedYear = this.closureSettings[0].academicYear;
        }
      },
      error: (err) => console.error('Failed to load closure settings', err)
    });
  }

  onYearChange(event: any): void {
    // The event.target.value will now be the settingID from the dropdown
    this.selectedSettingID = Number(event.target.value);

    // Find the label for UI display if needed
    const selected = this.closureSettings.find(s => s.settingID === this.selectedSettingID);
    if (selected) {
      this.selectedYear = selected.academicYear;
    }
  }

  exportData(): void {
    if (this.userRole !== 'QA Manager') return;
    if (!this.selectedSettingID) {
      this.messageService.add({ severity: 'warn', summary: 'Selection Required', detail: 'Please select an academic year.' });
      return;
    }

    this.messageService.add({ severity: 'info', summary: 'Exporting', detail: 'Preparing CSV...' });

    // Use the dynamic ID from the dropdown
    this.closureService.exportIdeas(this.selectedSettingID, 'csv').subscribe({
      next: (res) => {
        if (res.success && res.data.downloadUrl) {
          window.location.href = res.data.downloadUrl;
        }
      },
      error: (err) => {
        // Backend error if closure date hasn't passed
        this.messageService.add({ severity: 'error', summary: 'Export Failed', detail: err.error?.message });
      }
    });
  }

  loadSystemUsageData(): void {
    this.dashboardService.getUsageStats().subscribe({
      next: (res) => {
        const data = res.data;
        this.mostActiveUsers = data.mostActiveUsers;

        // Initialize Monitoring Charts
        this.initPagesChart(data.mostViewedPages);
        this.initBrowserChart(data.browserUsage);
      },
      error: (err) => console.error('Failed to load usage stats', err)
    });
  }

  private initPagesChart(pages: any[]): void {
    const ctx = document.getElementById('pagesChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.pagesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: pages.map(p => p.url),
        datasets: [{
          label: 'Views',
          data: pages.map(p => p.views),
          backgroundColor: '#6FCBF0'
        }]
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
        datasets: [{
          data: browsers.map(b => b.count),
          backgroundColor: ['#8B5CF6', '#EF4444', '#10B981']
        }]
      },
      options: { responsive: true, plugins: { title: { display: true, text: 'Browser Usage' } } }
    });
  }

  private initBarChart(): void {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains('app-dark');

    // Dynamic Data Assignment
    const chartLabels = this.isGlobalView ? this.departments : this.months;
    const chartData = this.isGlobalView ? this.ideasPerDepartment : this.ideasPerMonth;
    const chartTitle = this.isGlobalView ? 'Number of Ideas per Department' : 'Number of Ideas per Month';

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Number of Ideas',
          data: chartData,
          backgroundColor: this.isGlobalView ? 'rgba(136, 212, 171, 0.8)' : 'rgba(59, 130, 246, 0.8)',
          borderColor: this.isGlobalView ? 'rgba(136, 212, 171, 1)' : 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 8,
          barThickness: this.isGlobalView ? 40 : 25,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: chartTitle,
            color: isDark ? '#fff' : '#2c3e50',
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 20 }
          }
        }
      }
    });
  }

  private initDonutChart(): void {
    const canvas = document.getElementById('donutChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains('app-dark');

    // Dynamic Data Assignment
    const chartLabels = this.isGlobalView ? this.departments : this.categories;
    const chartData = this.isGlobalView ? this.ideasPerDepartment : this.ideasByCategory;
    const chartTitle = this.isGlobalView ? 'Percentage of Ideas per Department' : 'Percentage of Ideas by Category';

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartData,
          backgroundColor: this.chartColors,
          borderColor: isDark ? '#1f2937' : '#ffffff',
          borderWidth: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'right' },
          title: {
            display: true,
            text: chartTitle,
            color: isDark ? '#fff' : '#2c3e50',
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 20 }
          }
        }
      }
    });
  }

  private initHorizontalBarChart(): void {
    const canvas = document.getElementById('horizontalBarChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains('app-dark');

    // Dynamic Data Assignment
    const chartLabels = this.isGlobalView ? this.departments : this.months;
    const chartData = this.isGlobalView ? this.contributorsPerDepartment : this.contributorsPerMonth;
    const chartTitle = this.isGlobalView ? 'Number of Contributors per Department' : 'Number of Contributors per Month';

    this.horizontalBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Number of Contributors',
          data: chartData,
          backgroundColor: this.isGlobalView ? 'rgba(239, 138, 138, 0.8)' : 'rgba(234, 179, 8, 0.8)',
          borderColor: this.isGlobalView ? 'rgba(239, 138, 138, 1)' : 'rgba(234, 179, 8, 1)',
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 25,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: chartTitle,
            color: isDark ? '#fff' : '#2c3e50',
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 20 }
          }
        }
      }
    });
  }

  getProfileUrl(profilePath: string | null | undefined): string {
    if (!profilePath) return '';
    if (/^(https?:)?\/\//.test(profilePath)) return profilePath;
    const trimmed = profilePath.replace(/^\/+/, '');
    return `${environment.main_url.replace(/\/api$/, '')}/${trimmed}`;
  }

}