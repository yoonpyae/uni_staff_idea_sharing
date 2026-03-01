import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NAVIGATION_MENU, MenuItem } from '../app.menu';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ThemeService } from '../core/services/themeService';
import { AuthService } from '../core/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';

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

export class AppLayoutComponent implements OnInit {
  menuItems = NAVIGATION_MENU;
  currentUser = {
    name: 'Guest',
    role: 'Guest',
    profilePicture: ''
  };
  profilePictureUrl: string = '';
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  constructor(
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService,
    private cookieService: CookieService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    const name = this.cookieService.get('staffName') || 'Guest';
    const role = this.cookieService.get('roleName') || 'Guest';
    const profilePictureEncoded = this.cookieService.get('staffProfile') || '';
    const profilePicture = profilePictureEncoded ? decodeURIComponent(profilePictureEncoded) : '';
    this.currentUser = { name, role, profilePicture };

    if (profilePicture) {
      // if backend already returned a full URL, use it; otherwise extract the filename
      if (profilePicture.startsWith('http') || profilePicture.startsWith('data:')) {
        this.profilePictureUrl = profilePicture;
      } else {
        const parts = profilePicture.split('/').filter(Boolean);
        const basename = parts.length ? parts[parts.length - 1] : profilePicture;
        this.profilePictureUrl = `${environment.web_url.replace(/\/$/, '')}/uploads/staff_profiles/${basename}`;
      }
    } else {
      this.profilePictureUrl = '';
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Ensure mini-sidebar mode is disabled when opening on mobile
    if (this.isMobileMenuOpen) {
      this.isSidebarCollapsed = false;
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
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


  getSidebarState(): string {
    return this.isSidebarCollapsed ? 'out' : 'in';
  }

  getTextState(): string {
    return this.isSidebarCollapsed ? 'out' : 'in';
  }
}
