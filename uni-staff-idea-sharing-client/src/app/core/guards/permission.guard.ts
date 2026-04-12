import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);
  const requiredPermissions = route.data['permissions'] as string[];

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  const hasAccess = requiredPermissions.some(permission => 
    authService.hasPermission(permission)
  );

  if (hasAccess) {
    return true;
  }

  messageService.add({ 
    severity: 'error', 
    summary: 'Access Denied', 
    detail: 'You do not have permission to access this feature.' 
  });
  
  router.navigate(['/dashboard']);
  return false;
};

