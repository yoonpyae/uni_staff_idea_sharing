import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';

export const roleGuard: CanActivateFn = (route, state) => {
    const cookieService = inject(CookieService);
    const router = inject(Router);
    const messageService = inject(MessageService);
    const userRole = cookieService.get('roleName');
    const requiredRoles = route.data['roles'] as Array<string>;

    if (!userRole) {
        router.navigate(['/login']);
        return false;
    }

    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    if (requiredRoles.includes(userRole)) {
        return true;
    }

    messageService.add({ severity: 'error', summary: 'Access Denied', detail: 'You do not have permission to view this page.' });
    router.navigate(['/dashboard']);
    return false;
};