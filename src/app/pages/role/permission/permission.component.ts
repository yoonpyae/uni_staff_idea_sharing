import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.scss'
})
export class PermissionComponent implements OnInit {
  searchQuery: string = '';
  roleId!: number;
  roleName: string = 'Loading...';
  groupedPermissions: { category: string, permissions: any[] }[] = [];
  selectedPermissionIds: Set<number> = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private location: Location,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Get role ID from the URL
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.roleId = parseInt(idParam, 10);
      this.loadRoleData();
      this.loadAllPermissions();
    }
  }

  loadRoleData(): void {
    this.roleService.getById(this.roleId).subscribe({
      next: (res: any) => {
        const role = res.data;
        this.roleName = role.roleName;

        // Use the exact permissionID property from your backend
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach((p: any) => {
            this.selectedPermissionIds.add(p.permissionID);
          });
        }
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load role' })
    });
  }

  loadAllPermissions(): void {
    // Fetch every permission available in the system
    this.permissionService.get().subscribe({
      next: (res: any) => {
        const allPermissions = res.data;
        this.groupPermissions(allPermissions);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load permissions' })
    });
  }

  // Helper to categorize permissions into sections like your screenshot
  groupPermissions(permissions: any[]): void {
    const groups: { [key: string]: any[] } = {
      'Idea Management Permissions': [],
      'Department-Level Permissions': [],
      'Reporting & Data Permissions': [],
      'Administrative Permissions': [],
      'Other Permissions': []
    };

    permissions.forEach(perm => {
      // Safely grab the permission string and make it lowercase for easy matching
      const name = (perm.permission || '').toLowerCase();

      // Categorize based on keywords in the permission name
      if (name.includes('idea') || name.includes('comment') || name.includes('like') || name.includes('post')) {
        groups['Idea Management Permissions'].push(perm);
      } else if (name.includes('department') || name.includes('category')) {
        groups['Department-Level Permissions'].push(perm);
      } else if (name.includes('report') || name.includes('export') || name.includes('download') || name.includes('statistic')) {
        groups['Reporting & Data Permissions'].push(perm);
      } else if (name.includes('staff') || name.includes('role') || name.includes('closure') || name.includes('assign') || name.includes('user')) {
        groups['Administrative Permissions'].push(perm);
      } else {
        groups['Other Permissions'].push(perm);
      }
    });

    // Convert to array for the HTML template, ignoring empty groups
    this.groupedPermissions = Object.keys(groups)
      .filter(key => groups[key].length > 0)
      .map(key => ({
        category: key,
        permissions: groups[key]
      }));
  }

  // Toggle checkbox state
  togglePermission(permId: number, event: any): void {
    if (event.target.checked) {
      this.selectedPermissionIds.add(permId);
    } else {
      this.selectedPermissionIds.delete(permId);
    }
  }

  // Check if a checkbox should be checked
  hasPermission(permId: number): boolean {
    return this.selectedPermissionIds.has(permId);
  }

  saveChanges(): void {
    // Convert Set back to an array for the API
    const payload = {
      permissionIDs: Array.from(this.selectedPermissionIds)
    };

    this.roleService.assignPermissions(this.roleId, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Permissions updated successfully' });
        setTimeout(() => this.goBack(), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update permissions' });
      }
    });
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value.toLowerCase();
  }

  goBack(): void {
    this.location.back();
  }
}
