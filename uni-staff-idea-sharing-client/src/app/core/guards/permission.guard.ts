import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  // 1. Get required permissions from the route's data object
  const requiredPermissions = route.data['permissions'] as string[];

  // 2. If no specific permissions are required, allow access
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // 3. Check if the user has the required permission
  const hasAccess = requiredPermissions.some(permission => 
    authService.hasPermission(permission)
  );

  if (hasAccess) {
    return true;
  }

  // 4. If unauthorized, show a message and redirect to dashboard
  messageService.add({ 
    severity: 'error', 
    summary: 'Access Denied', 
    detail: 'You do not have permission to access this feature.' 
  });
  
  router.navigate(['/dashboard']);
  return false;
};