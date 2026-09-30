import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        title: 'GooD4Life',
        loadComponent: () =>
            import('./features/landing/landing-page/landing-page')
                .then(m => m.LandingPage),
    },
    {
        path: 'login',
        title: 'Sign in | GooD4Life',
        loadComponent: () =>
            import('./features/auth/login-page/login-page')
                .then(m => m.LoginPage),
    },
    {
        path: 'register',
        title: 'Create account | GooD4Life',
        loadComponent: () =>
            import('./features/auth/register-page/register-page')
                .then(m => m.RegisterPage),
    },
    {
        path: 'onboarding',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'welcome',
            },
            {
                path: 'welcome',
                title: 'Welcome | GooD4Life',
                loadComponent: () =>
                    import('./features/onboarding/welcome-page/welcome-page')
                        .then(m => m.WelcomePage),
            },
            {
                path: 'consent',
                title: 'Consent | GooD4Life',
                loadComponent: () =>
                    import('./features/onboarding/consent-step/consent-step')
                        .then(m => m.ConsentStep),
            },
            {
                path: 'profile',
                title: 'Your profile | GooD4Life',
                loadComponent: () =>
                    import('./features/onboarding/profile-step/profile-step')
                        .then(m => m.ProfileStep),
            },
            {
                path: 'income',
                title: 'Monthly finances | GooD4Life',
                loadComponent: () =>
                    import('./features/onboarding/income-step/income-step')
                        .then(m => m.IncomeStep),
            },
            {
                path: 'complete',
                title: 'Onboarding complete | GooD4Life',
                loadComponent: () =>
                    import(
                        './features/onboarding/onboarding-complete-page/onboarding-complete-page'
                    ).then(m => m.OnboardingCompletePage),
            },
        ],
    },
    {
        path: '',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        loadComponent: () =>
            import('./layout/app-shell/app-shell')
                .then(m => m.AppShell),
        children: [
            {
                path: 'dashboard',
                title: 'Dashboard | GooD4Life',
                loadComponent: () =>
                    import('./features/dashboard/dashboard-page/dashboard-page')
                        .then(m => m.DashboardPage),
            },
            {
                path: 'debts',
                title: 'My debts | GooD4Life',
                loadComponent: () =>
                    import('./features/debts/debt-list-page/debt-list-page')
                        .then(m => m.DebtListPage),
            },
            {
                path: 'repayment-plan',
                title: 'Repayment plan | GooD4Life',
                loadComponent: () =>
                    import('./features/repayment/repayment-plan-page/repayment-plan-page')
                        .then(m => m.RepaymentPlanPage),
            },
            {
                path: 'debt-options',
                title: 'Debt options | GooD4Life',
                loadComponent: () =>
                    import('./features/debt-options/debt-options-page/debt-options-page')
                        .then(m => m.DebtOptionsPage),
            },
        ],
    },

    {
        path: '**',
        redirectTo: '',
    },
];