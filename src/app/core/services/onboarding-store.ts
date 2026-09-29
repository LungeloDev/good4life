import { computed, Injectable, signal } from '@angular/core';

export interface OnboardingProfile {
    fullName: string;
    email: string;
    phone: string;
}

export interface OnboardingIncome {
    monthlyIncome: number;
    monthlyExpenses: number;
}

@Injectable({ providedIn: 'root' })
export class OnboardingStore {
    readonly consentAccepted = signal(false);

    readonly profile = signal<OnboardingProfile>({
        fullName: '',
        email: '',
        phone: '',
    });

    readonly income = signal<OnboardingIncome>({
        monthlyIncome: 0,
        monthlyExpenses: 0,
    });

    readonly incomeEntered = signal(false);

    readonly remainingBeforeDebtPayments = computed(() =>
        this.income().monthlyIncome - this.income().monthlyExpenses
    );

    readonly complete = computed(() =>
        this.consentAccepted() &&
        this.profile().fullName.trim().length > 0 &&
        this.profile().email.trim().length > 0 &&
        this.incomeEntered()
    );
}