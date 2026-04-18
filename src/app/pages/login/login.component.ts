import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { RootModel } from '../../core/models/root.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('600ms 200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('float', [
      state('*', style({ transform: 'translateY(0)' })),
      transition('* => *', [
        animate('3000ms ease-in-out', style({ transform: 'translateY(-10px)' })),
        animate('3000ms ease-in-out', style({ transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        this.messageService.add({
          severity: res.success ? 'success' : 'info',
          summary: res.success ? 'Success' : 'Info',
          detail: res.message || 'Logged in',
          key: environment.default_toastKey
        });

        if (res.success) {
          const prevLogin = res.data.previous_login_at;
          this.cookieService.set('previousLoginAt', prevLogin ? prevLogin : 'first_login');
          sessionStorage.setItem('showLoginReminder', 'true');
          const userRole = this.cookieService.get('roleName') || '';
          if (userRole.toLowerCase() === 'staff') {
            this.router.navigate(['/staff-idea-feed']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      },
      error: (err) => {
        this.isLoading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: err.error.message || err.message || 'Unable to login',
          key: environment.default_toastKey
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


}
