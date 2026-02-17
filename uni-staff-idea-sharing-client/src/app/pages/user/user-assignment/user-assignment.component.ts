// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { InputTextModule } from 'primeng/inputtext';
// import { ButtonModule } from 'primeng/button';
// import { ToastModule } from 'primeng/toast';
// import { MessageService } from 'primeng/api';
// import { StaffModel } from '../../../core/models/staff.model';


// @Component({
//   selector: 'app-user-assignment',
//    imports: [
//     CommonModule,
//     FormsModule,
//     InputTextModule,
//     ButtonModule,
//     ToastModule
//   ],
//   providers: [MessageService],
//   templateUrl: './user-assignment.component.html',
//   styleUrl: './user-assignment.component.scss'
// })
// export class UserAssignmentComponent implements OnInit{
//  isCreateMode: boolean = false;
//   pageTitle: string = 'Edit User';
  
//   user: StaffModel = {
//     staffID: 0,
//     staffName: '',
//     staffEmail: '',
//     staffPhNo: '',
//     roleID: '',
//     departmentID: []
//   };

//   availableRoles = [
//     { id: 'administrator', name: 'Administrator' },
//     { id: 'qa-manager', name: 'QA Manager' },
//     { id: 'qa-coordinator', name: 'QA Coordinator' },
//     { id: 'staff', name: 'Staff' }
//   ];

//   availableDepartments = [
//     { id: 'it', name: 'IT' },
//     { id: 'fine-arts', name: 'Fine Arts' },
//     { id: 'music', name: 'Music' },
//     { id: 'literature', name: 'Literature' },
//     { id: 'english', name: 'English' },
//     { id: 'history', name: 'History' },
//     { id: 'science', name: 'Science' },
//     { id: 'business', name: 'Business' },
//     { id: 'engineering', name: 'Engineering' },
//     { id: 'computer-science', name: 'Computer Science' },
//     { id: 'social-studies', name: 'Social Studies' },
//     { id: 'physics', name: 'Physics' }
//   ];

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private messageService: MessageService
//   ) {}

//   ngOnInit(): void {
//     const userId = this.route.snapshot.paramMap.get('id');
    
//     if (userId === 'create') {
//       this.isCreateMode = true;
//       this.pageTitle = 'Create New User';
//       this.user = this.getEmptyUser();
//     } else if (userId) {
//       this.isCreateMode = false;
//       this.pageTitle = 'Edit User';
//       this.loadUser(parseInt(userId));
//     }
//   }

//   private getEmptyUser(): UserDetail {
//     return {
//       id: 0,
//       name: '',
//       email: '',
//       phone: '',
//       role: '',
//       departments: []
//     };
//   }

//   private loadUser(id: number): void {
//     // Sample data - replace with actual API call
//     this.user = {
//       id: 10,
//       name: 'Scott Summers',
//       email: 'scottsummers123@gmail.com',
//       phone: '+9595203443',
//       role: 'Staff',
//       departments: ['English']
//     };
//   }

//   selectRole(roleName: string): void {
//     this.user.role = roleName;
//   }

//   isRoleSelected(roleName: string): boolean {
//     return this.user.role === roleName;
//   }

//   toggleDepartment(deptName: string): void {
//     const index = this.user.departments.indexOf(deptName);
//     if (index > -1) {
//       this.user.departments.splice(index, 1);
//     } else {
//       this.user.departments.push(deptName);
//     }
//   }

//   isDepartmentSelected(deptName: string): boolean {
//     return this.user.departments.includes(deptName);
//   }

//   saveChanges(): void {
//     // Validation
//     if (!this.user.name || !this.user.email || !this.user.role || this.user.departments.length === 0) {
//       this.messageService.add({
//         severity: 'warn',
//         summary: 'Validation Error',
//         detail: 'Please fill in all required fields and select at least one department',
//         life: 3000
//       });
//       return;
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(this.user.email)) {
//       this.messageService.add({
//         severity: 'error',
//         summary: 'Invalid Email',
//         detail: 'Please enter a valid email address',
//         life: 3000
//       });
//       return;
//     }

//     if (this.isCreateMode) {
//       // Create new user
//       console.log('Creating new user:', this.user);
      
//       this.messageService.add({
//         severity: 'success',
//         summary: 'User Created',
//         detail: `User ${this.user.name} created successfully`,
//         life: 3000
//       });
//     } else {
//       // Update existing user
//       console.log('Updating user:', this.user);
      
//       this.messageService.add({
//         severity: 'success',
//         summary: 'User Updated',
//         detail: 'User information updated successfully',
//         life: 3000
//       });
//     }

//     // Navigate back after a short delay
//     setTimeout(() => {
//       this.goBack();
//     }, 1500);
//   }

//   resetPassword(): void {
//     if (this.isCreateMode) {
//       this.messageService.add({
//         severity: 'info',
//         summary: 'Info',
//         detail: 'Password will be sent to user email after account creation',
//         life: 3000
//       });
//       return;
//     }

//     this.messageService.add({
//       severity: 'info',
//       summary: 'Password Reset',
//       detail: 'Password reset link has been sent to the user\'s email',
//       life: 3000
//     });
//   }

//   goBack(): void {
//     this.router.navigate(['/user-accounts']);
//   }
// }
