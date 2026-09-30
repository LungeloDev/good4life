import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DebtStore } from '../../../core/services/debt-store';
import { PageHeader } from '../../../shared/page-header/page-header';
import { EmptyState } from '../../../shared/empty-state/empty-state';

import { FinancialOverview } from '../financial-overview/financial-overview';
import { NextTargetCard } from '../next-target-card/next-target-card';
import { ProgressCard } from '../progress-card/progress-card';

import { LoadingState } from '../../../shared/loading-state/loading-state';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    PageHeader,
    EmptyState,
    FinancialOverview,
    NextTargetCard,
    ProgressCard,
    LoadingState
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  readonly store = inject(DebtStore);
}