import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const userServerAvailabilityGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const currentUser = authService.currentUserSignal();

    if (!currentUser || currentUser.role !== 'user') {
        return true;
    }

    const redirectToBusy = () => {
        authService.logout();
        return router.createUrlTree(['/sign-in'], {
            queryParams: { serverBusy: '1' }
        });
    };

    if (currentUser.uiConfig) {
        return authService.isUserServerDown() ? redirectToBusy() : true;
    }

    return authService.getBackendUserProfile().pipe(
        map((profile) => {
            if (profile?.ui_config?.server_down) {
                return redirectToBusy();
            }
            return true;
        }),
        catchError(() => of(true))
    );
};
