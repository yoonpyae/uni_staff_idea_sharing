import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NAVIGATION_MENU, MenuItem } from '../app.menu';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ThemeService } from '../core/services/themeService';

@Component({
  selector: 'app-layout',
   imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  animations: [
    trigger('slideInOut', [
      state('in', style({
        width: '260px',
        opacity: 1
      })),
      state('out', style({
        width: '80px',
        opacity: 1
      })),
      transition('in <=> out', animate('300ms ease-in-out'))
    ]),
    trigger('fadeInOut', [
      state('in', style({
        opacity: 1,
        display: 'block'
      })),
      state('out', style({
        opacity: 0,
        display: 'none'
      })),
      transition('in => out', [
        animate('200ms ease-out')
      ]),
      transition('out => in', [
        style({ display: 'block' }),
        animate('200ms 100ms ease-in')
      ])
    ])
  ],
  styleUrl: './layout.component.scss'
})

export class AppLayoutComponent {
 menuItems = NAVIGATION_MENU;
  currentUser = {
    name: 'William Jones',
    role: 'Admin',
  };
  isSidebarCollapsed = false;

  constructor(
    private router: Router,
    public themeService: ThemeService
  ) {}

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    // TODO: Implement logout logic
    console.log('Logout clicked');
    this.router.navigate(['/login']);
  }

  getSidebarState(): string {
    return this.isSidebarCollapsed ? 'out' : 'in';
  }

  getTextState(): string {
    return this.isSidebarCollapsed ? 'out' : 'in';
  }
}
