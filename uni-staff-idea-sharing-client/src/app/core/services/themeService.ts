import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal for reactive theme state
  theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Apply theme on initialization
    this.applyTheme(this.theme());

    // Watch for theme changes
    effect(() => {
      this.applyTheme(this.theme());
    });
  }

  private getInitialTheme(): Theme {
    // Check localStorage first
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('app-dark');
    } else {
      root.classList.remove('app-dark');
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }

  toggleTheme(): void {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }
}