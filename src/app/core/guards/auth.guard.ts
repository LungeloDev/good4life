import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { OnboardingStore } from '../services/onboarding-store';

export const authGuard: CanActivateFn = async (_route, state) => {
    const auth = inject(AuthService);
    const onboarding = inject(OnboardingStore);
    const router = inject(Router);

    await auth.waitUntilReady();

    if (!auth.isAuthenticated()) {
        return router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url },
        });
    }

    try {
        await onboarding.load();
    } catch {
        return router.createUrlTree(['/login'], {
            queryParams: {
                returnUrl: state.url,
                dataError: 'true',
            },
        });
    }

    if (
        !onboarding.complete() &&
        !state.url.startsWith('/onboarding')
    ) {
        return router.createUrlTree(['/onboarding/welcome']);
    }

    return true;
};