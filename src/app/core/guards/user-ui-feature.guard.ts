import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

type UserFeatureKey = 'supportChat' | 'agreements' | 'groupChat' | 'privateChat';

export const userUiFeatureGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notification = inject(NotificationService);
    const currentUser = authService.currentUserSignal();
    const feature = String(route.data?.['userUiFeature'] || '').trim() as UserFeatureKey;

    if (!currentUser || currentUser.role !== 'user' || !feature) {
        return true;
    }

    const redirectToDashboard = () => {
        notification.warning('This section is currently locked for your account.');
        return router.createUrlTree(['/dashboard']);
    };

    if (currentUser.uiConfig) {
        return authService.isUserFeatureLocked(feature) ? redirectToDashboard() : true;
    }

    return authService.getBackendUserProfile().pipe(
        map((profile) => {
            const rawConfig = profile?.ui_config;
            const featureLocked = (
                (feature === 'supportChat' && !!rawConfig?.support_chat_locked) ||
                (feature === 'agreements' && !!rawConfig?.agreements_locked) ||
                (feature === 'groupChat' && !!rawConfig?.group_chat_locked) ||
                (feature === 'privateChat' && !!rawConfig?.private_chat_locked)
            );
            return featureLocked ? redirectToDashboard() : true;
        }),
        catchError(() => of(true))
    );
};
