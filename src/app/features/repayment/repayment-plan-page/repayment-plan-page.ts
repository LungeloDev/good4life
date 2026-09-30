import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DebtStore } from '../../../core/services/debt-store';
import { PageHeader } from '../../../shared/page-header/page-header';
import { EmptyState } from '../../../shared/empty-state/empty-state';

import {
  RepaymentPriorityItem,
  RepaymentPriorityList,
} from '../repayment-priority-list/repayment-priority-list';

import {
  RepaymentTimeline,
  RepaymentTimelineItem,
} from '../repayment-timeline/repayment-timeline';
import { LoadingState } from '../../../shared/loading-state/loading-state';

@Component({
  selector: 'app-repayment-plan-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    RouterLink,
    PageHeader,
    EmptyState,
    RepaymentPriorityList,
    RepaymentTimeline,
    LoadingState
  ],
  templateUrl: './repayment-plan-page.html',
  styleUrl: './repayment-plan-page.css',
})
export class RepaymentPlanPage {
  readonly store = inject(DebtStore);
  readonly horizon = 120;

  readonly projection = computed(() => {
    const debts = this.store.orderedDebts();

    // Calculate using cents to avoid floating-point payment drift.
    const balances = debts.map(debt => Math.round(debt.balance * 100));
    const monthlyAmounts = debts.map(debt =>
      Math.round(debt.monthlyPayment * 100)
    );

    const budget = monthlyAmounts.reduce((total, amount) => total + amount, 0);
    const startingTotal = balances.reduce((total, amount) => total + amount, 0);

    const payoffMonths = new Map<string, number>();
    const timeline: RepaymentTimelineItem[] = [];

    if (budget <= 0 || startingTotal <= 0) {
      return { timeline, payoffMonths, complete: startingTotal === 0 };
    }

    for (let month = 1; month <= this.horizon; month++) {
      const targetIndex = balances.findIndex(balance => balance > 0);
      if (targetIndex === -1) break;

      const targetName = debts[targetIndex].name;
      let available = budget;
      let paid = 0;

      // First cover each active debt's entered monthly payment.
      for (let index = 0; index < debts.length; index++) {
        if (balances[index] <= 0) continue;

        const payment = Math.min(balances[index], monthlyAmounts[index]);

        balances[index] -= payment;
        available -= payment;
        paid += payment;

        if (balances[index] === 0) {
          payoffMonths.set(debts[index].id, month);
        }
      }

      // Allocate unused budget in smallest-balance-first order.
      for (let index = 0; index < debts.length && available > 0; index++) {
        if (balances[index] <= 0) continue;

        const payment = Math.min(balances[index], available);

        balances[index] -= payment;
        available -= payment;
        paid += payment;

        if (balances[index] === 0) {
          payoffMonths.set(debts[index].id, month);
        }
      }

      const remaining = balances.reduce((total, balance) => total + balance, 0);

      timeline.push({
        month: `Month ${month}`,
        debtName: `Focus: ${targetName}`,
        payment: paid / 100,
        remainingBalance: remaining / 100,
        progress: Math.min(
          100,
          Math.round(((startingTotal - remaining) / startingTotal) * 100)
        ),
        status: month === 1 ? 'current' : 'upcoming',
      });

      if (remaining === 0) break;
    }

    return {
      timeline,
      payoffMonths,
      complete: balances.every(balance => balance === 0),
    };
  });

  readonly priorityItems = computed<RepaymentPriorityItem[]>(() => {
    const payoffMonths = this.projection().payoffMonths;

    return this.store.orderedDebts().map(
      (debt, index): RepaymentPriorityItem => ({
        id: debt.id,
        rank: index + 1,
        name: debt.name,
        creditor: 'Entered debt',
        balance: debt.balance,
        monthlyPayment: debt.monthlyPayment,
        estimatedMonths: payoffMonths.get(debt.id) ?? null,
        status: index === 0 ? 'next' : 'current',
        reason:
          index === 0
            ? 'The smallest positive balance entered is the first focus debt.'
            : 'This debt follows in ascending balance order while its entered monthly payment continues.',
      })
    );
  });

  readonly timeline = computed(() => this.projection().timeline);

  readonly firstYear = computed(() => this.timeline().slice(0, 12));

  readonly projectedMonths = computed(() =>
    this.projection().complete ? this.timeline().length : null
  );
}