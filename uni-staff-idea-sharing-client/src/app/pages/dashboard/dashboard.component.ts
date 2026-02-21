import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
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
  searchQuery = '';

  // Charts
  barChart: Chart | null = null;
  donutChart: Chart | null = null;
  horizontalBarChart: Chart | null = null;

  stats = [
    { label: 'Total Ideas', value: 250, icon: 'pi-lightbulb' },
    { label: 'Total Contributors', value: 150, icon: 'pi-users' },
    { label: 'Anonymous Ideas', value: 66, icon: 'pi-eye-slash' },
    { label: 'Ideas without Cmts', value: 25, icon: 'pi-comment' },
  ];

  years = [
    this.currentYear,
    this.currentYear - 1,
    this.currentYear - 2,
  ];

  // Department data
  departments = [
    'Dep 1', 'Dep 2', 'Dep 3', 'Dep 4', 'Dep 5',
    'Dep 6', 'Dep 7', 'Dep 8', 'Dep 9', 'Dep 10'
  ];

  ideasPerDepartment = [55, 25, 32, 12, 28, 45, 92, 27, 75, 18];
  contributorsPerDepartment = [38, 42, 26, 12, 48, 35, 24, 12, 36, 44];

  // Chart colors
  chartColors = [
    '#8B5CF6', '#EF4444', '#06B6D4', '#F59E0B', '#F97316',
    '#22C55E', '#3B82F6', '#EC4899', '#14B8A6', '#FACC15'
  ];

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initBarChart();
      this.initDonutChart();
      this.initHorizontalBarChart();
    }, 100);
  }

  ngOnDestroy(): void {
    // Cleanup charts
    this.barChart?.destroy();
    this.donutChart?.destroy();
    this.horizontalBarChart?.destroy();
  }

  onYearChange(event: any): void {
    this.selectedYear = parseInt(event.target.value);
    console.log('Year changed to:', this.selectedYear);
    // Optionally reload chart data here
  }

  onExport(): void {
    console.log('Export clicked');
  }

  private initBarChart(): void {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains('app-dark');

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.departments,
        datasets: [{
          label: 'Number of Ideas',
          data: this.ideasPerDepartment,
          backgroundColor: 'rgba(136, 212, 171, 0.8)',
          borderColor: 'rgba(136, 212, 171, 1)',
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 40,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart',
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 100;
            }
            return delay;
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Number of Ideas per Department',
            color: isDark ? '#fff' : '#2c3e50',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              bottom: 20
            }
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            titleColor: isDark ? '#fff' : '#2c3e50',
            bodyColor: isDark ? '#fff' : '#2c3e50',
            borderColor: isDark ? 'rgba(136, 212, 171, 0.5)' : 'rgba(168, 230, 207, 0.5)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context) => `Ideas: ${context.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 25,
              color: isDark ? '#9ca3af' : '#6b7280',
              font: {
                size: 12
              }
            },
            grid: {
              color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }
          },
          x: {
            ticks: {
              color: isDark ? '#9ca3af' : '#6b7280',
              font: {
                size: 12
              }
            },
            grid: {
              display: false,
            }
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

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.departments,
        datasets: [{
          data: this.ideasPerDepartment,
          backgroundColor: this.chartColors,
          borderColor: isDark ? '#1f2937' : '#ffffff',
          borderWidth: 3,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              color: isDark ? '#fff' : '#2c3e50',
              padding: 15,
              font: {
                size: 12
              },
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i] as number;
                    const total = (data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(0);
                    return {
                      text: `${label}: ${percentage}%`,
                      fillStyle: (data.datasets[0].backgroundColor as string[])[i],
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          title: {
            display: true,
            text: 'Percentage of Ideas per Department',
            color: isDark ? '#fff' : '#2c3e50',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              bottom: 20
            }
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            titleColor: isDark ? '#fff' : '#2c3e50',
            bodyColor: isDark ? '#fff' : '#2c3e50',
            borderColor: isDark ? 'rgba(136, 212, 171, 0.5)' : 'rgba(168, 230, 207, 0.5)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} ideas (${percentage}%)`;
              }
            }
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

    this.horizontalBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.departments,
        datasets: [{
          label: 'Number of Contributors',
          data: this.contributorsPerDepartment,
          backgroundColor: 'rgba(239, 138, 138, 0.8)',
          borderColor: 'rgba(239, 138, 138, 1)',
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 25,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart',
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 80;
            }
            return delay;
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Number of Contributors per Department',
            color: isDark ? '#fff' : '#2c3e50',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              bottom: 20
            }
          },
          tooltip: {
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            titleColor: isDark ? '#fff' : '#2c3e50',
            bodyColor: isDark ? '#fff' : '#2c3e50',
            borderColor: isDark ? 'rgba(239, 138, 138, 0.5)' : 'rgba(255, 182, 193, 0.5)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context) => `Contributors: ${context.parsed.x}`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 60,
            ticks: {
              stepSize: 10,
              color: isDark ? '#9ca3af' : '#6b7280',
              font: {
                size: 12
              }
            },
            grid: {
              color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }
          },
          y: {
            ticks: {
              color: isDark ? '#9ca3af' : '#6b7280',
              font: {
                size: 12
              }
            },
            grid: {
              display: false,
            }
          }
        }
      }
    });
  }
}
