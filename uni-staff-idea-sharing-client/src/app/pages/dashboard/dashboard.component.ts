import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

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
export class DashboardComponent {
   currentYear = new Date().getFullYear();
  selectedYear = this.currentYear;
  searchQuery = '';

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

  onYearChange(event: any): void {
    this.selectedYear = parseInt(event.target.value);
    console.log('Year changed to:', this.selectedYear);
  }

  onSearch(): void {
    console.log('Search query:', this.searchQuery);
  }
}
