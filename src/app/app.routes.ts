import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
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
        path: '',
        loadComponent: () =>
            import('./layout/app-shell/app-shell')
                .then(m => m.AppShell),
        children: [
            {
                path: 'onboarding',
                children: [
                    { path: '', pathMatch: 'full', redirectTo: 'welcome' },
                    {
                        path: 'welcome',
                        loadComponent: () =>
                            import('./features/onboarding/welcome-page/welcome-page')
                                .then(m => m.WelcomePage),
                    },
                    {
                        path: 'consent',
                        loadComponent: () =>
                            import('./features/onboarding/consent-step/consent-step')
                                .then(m => m.ConsentStep),
                    },
                    {
                        path: 'profile',
                        loadComponent: () =>
                            import('./features/onboarding/profile-step/profile-step')
                                .then(m => m.ProfileStep),
                    },
                    {
                        path: 'income',
                        loadComponent: () =>
                            import('./features/onboarding/income-step/income-step')
                                .then(m => m.IncomeStep),
                    },
                    {
                        path: 'complete',
                        loadComponent: () =>
                            import('./features/onboarding/onboarding-complete-page/onboarding-complete-page')
                                .then(m => m.OnboardingCompletePage),
                    },
                ],
            },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/dashboard/dashboard-page/dashboard-page')
                        .then(m => m.DashboardPage),
            },
            {
                path: 'debts',
                loadComponent: () =>
                    import('./features/debts/debt-list-page/debt-list-page')
                        .then(m => m.DebtListPage),
            },
            {
                path: 'repayment-plan',
                loadComponent: () =>
                    import('./features/repayment/repayment-plan-page/repayment-plan-page')
                        .then(m => m.RepaymentPlanPage),
            },
        ],
    },
    { path: '**', redirectTo: '' },
];