import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../environments/environment';
import { StaffService } from '../../core/services/staff.service';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.scss'
})
export class AccountDetailsComponent implements OnInit {
  isEditing: boolean = false;
  isStaffRole: boolean = false;
  isChangingPassword: boolean = false;

  user: any = {
    staffID: 0,
    staffName: '',
    staffPhNo: '',
    staffEmail: '',
    password: '', // Kept empty unless they want to change it
    departmentName: '',
    roleName: '',
    staffProfile: ''
  };

  profilePictureUrl: string = '';
  selectedProfileFile?: File;

  showPasswordModal: boolean = false;
  passwordData = {
    old_password: '',
    new_password: '',
    new_password_confirmation: ''
  };

  constructor(
    private cookieService: CookieService,
    private staffService: StaffService,
    private messageService: MessageService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.isStaffRole = this.cookieService.get('roleName') === 'Staff';
    const staffIdStr = this.cookieService.get('staffID');
    if (staffIdStr) {
      this.loadUserDetails(parseInt(staffIdStr, 10));
    } else {
      this.user.staffName = this.cookieService.get('staffName') || 'Guest';
      this.user.roleName = this.cookieService.get('roleName') || 'Guest';
      this.setProfileUrl(this.cookieService.get('staffProfile'));
    }
  }

  loadUserDetails(id: number): void {
    this.staffService.getById(id).subscribe({
      next: (res: any) => {
        const data = res.data;
        this.user.staffID = data.staffID;
        this.user.staffName = data.staffName;
        this.user.staffPhNo = data.staffPhNo;
        this.user.staffEmail = data.staffEmail;
        this.user.departmentName = data.department?.departmentName || 'N/A';
        this.user.roleName = data.role?.roleName || 'N/A';
        this.setProfileUrl(data.staffProfile);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load account details.' });
      }
    });
  }

  setProfileUrl(profilePath: string): void {
    this.user.staffProfile = profilePath;
    if (!profilePath) {
      this.profilePictureUrl = '';
      return;
    }
    if (profilePath.startsWith('http') || profilePath.startsWith('data:')) {
      this.profilePictureUrl = profilePath;
    } else {
      const parts = profilePath.split('/').filter(Boolean);
      const basename = parts.length ? parts[parts.length - 1] : profilePath;
      this.profilePictureUrl = `${environment.base_url.replace(/\/$/, '')}/uploads/staff_profiles/${basename}`;
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  onProfileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedProfileFile = input.files[0];

      // Create a temporary preview URL for the selected image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePictureUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedProfileFile);

      // Auto-save the profile picture immediately (optional, or wait for standard save)
      this.saveChanges();
    }
  }

  saveChanges(): void {
    if (!this.user.staffID) return;

    const form = new FormData();
    form.append('staffName', this.user.staffName);
    form.append('staffPhNo', this.user.staffPhNo);
    form.append('staffEmail', this.user.staffEmail);

    // Only send password if they typed a new one
    if (this.user.password) {
      form.append('staffPassword', this.user.password);
    }

    if (this.selectedProfileFile) {
      form.append('staffProfile', this.selectedProfileFile);
    }

    this.staffService.update(this.user.staffID, form).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully!' });
        this.isEditing = false;
        this.user.password = ''; // Clear password field after save
        this.selectedProfileFile = undefined;

        // Update cookie with new profile picture if needed
        if (res.data && res.data.staffProfile) {
          this.setProfileUrl(res.data.staffProfile);
          this.cookieService.set('staffProfile', encodeURIComponent(res.data.staffProfile), { path: '/' });
        }
      },
      error: (err) => {
        const detail = err?.error.message || 'Failed to update profile.';
        this.messageService.add({ severity: 'error', summary: 'Update Failed', detail });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  openPasswordModal(): void {
    this.passwordData = { old_password: '', new_password: '', new_password_confirmation: '' };
    this.showPasswordModal = true;
  }

  submitPasswordChange(): void {
    // Simple frontend validation
    if (!this.passwordData.old_password || !this.passwordData.new_password) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all fields.' });
      return;
    }

    if (this.passwordData.new_password !== this.passwordData.new_password_confirmation) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'New passwords do not match.' });
      return;
    }

    this.isChangingPassword = true;

    // Call the backend API
    this.staffService.changePassword(this.passwordData).subscribe({
      next: (res: any) => {
        this.isChangingPassword = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully!' });
        this.showPasswordModal = false;
      },
      error: (err) => {
        this.isChangingPassword = false;
        const detail = err.error.message || 'Failed to change password.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: detail });
      }
    });
  }
}