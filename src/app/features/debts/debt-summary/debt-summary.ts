import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Debt } from '../../../core/models/debt';

@Component({
  selector: 'app-debt-summary',
  imports: [CurrencyPipe],
  templateUrl: './debt-summary.html',
  styleUrl: './debt-summary.css',
})
export class DebtSummary {
  readonly debts = input<Debt[]>([]);

  readonly totalBalance = computed(() =>
    this.debts().reduce((total, debt) => total + debt.balance, 0)
  );

  readonly totalMonthlyPayment = computed(() =>
    this.debts().reduce((total, debt) => total + debt.monthlyPayment, 0)
  );

  readonly nextTarget = computed(() =>
    [...this.debts()].sort((a, b) => a.balance - b.balance)[0] ?? null
  );
}