import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';

export const roleGuard: CanActivateFn = (route, state) => {
    const cookieService = inject(CookieService);
    const router = inject(Router);
    const messageService = inject(MessageService);

    // Get the user's role from the cookie (saved during login)
    const userRole = cookieService.get('roleName');

    // Get the allowed roles defined in the route's data
    const requiredRoles = route.data['roles'] as Array<string>;

    // 1. Check if they are logged in at all
    if (!userRole) {
        router.navigate(['/login']);
        return false;
    }

    // 2. If the route doesn't restrict to specific roles, let them in
    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    // 3. Check if the user's role is inside the allowed roles array
    if (requiredRoles.includes(userRole)) {
        return true;
    }

    // 4. If they reach here, they are logged in but don't have permission
    messageService.add({ severity: 'error', summary: 'Access Denied', detail: 'You do not have permission to view this page.' });
    router.navigate(['/dashboard']); // Send them back to a safe page
    return false;
};