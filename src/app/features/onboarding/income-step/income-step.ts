import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { OnboardingStore } from '../../../core/services/onboarding-store';
import { PublicHeader } from '../../../layout/public-header/public-header';
import { StepIndicator } from '../../../shared/step-indicator/step-indicator';

@Component({
  selector: 'app-income-step',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    RouterLink,
    PublicHeader,
    StepIndicator,
  ],
  templateUrl: './income-step.html',
  styleUrl: '../onboarding.css',
})
export class IncomeStep {
  private readonly store = inject(OnboardingStore);
  private readonly router = inject(Router);

  monthlyIncome: number | null = this.store.incomeEntered()
    ? this.store.income().monthlyIncome
    : null;

  monthlyExpenses: number | null = this.store.incomeEntered()
    ? this.store.income().monthlyExpenses
    : null;

  get remaining(): number | null {
    if (this.monthlyIncome === null || this.monthlyExpenses === null) {
      return null;
    }

    return this.monthlyIncome - this.monthlyExpenses;
  }

  continue(form: NgForm): void {
    const income = this.monthlyIncome;
    const expenses = this.monthlyExpenses;

    if (
      form.invalid ||
      income === null ||
      expenses === null ||
      !Number.isFinite(income) ||
      !Number.isFinite(expenses) ||
      income < 0 ||
      expenses < 0
    ) {
      form.control.markAllAsTouched();
      return;
    }

    this.store.income.set({
      monthlyIncome: income,
      monthlyExpenses: expenses,
    });

    this.store.incomeEntered.set(true);

    void this.router.navigate(['/onboarding/complete']);
  }
}