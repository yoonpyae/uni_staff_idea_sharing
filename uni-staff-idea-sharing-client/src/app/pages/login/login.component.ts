import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { trigger, transition, style, animate, state } from '@angular/animations';

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
export class LoginComponent {
email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(private router: Router) {}

  onSubmit(): void {
    // TODO: Implement authentication logic
    console.log('Login attempt:', { email: this.email });
    
    // For now, navigate to dashboard on any login attempt
    // Replace this with actual authentication
    if (this.email && this.password) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
