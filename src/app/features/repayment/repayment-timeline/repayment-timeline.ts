import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';

export interface RepaymentTimelineItem {
  month: string;
  debtName: string;
  payment: number;
  remainingBalance: number;
  progress: number;
  status: 'current' | 'upcoming' | 'completed';
}

@Component({
  selector: 'app-repayment-timeline',
  imports: [CurrencyPipe],
  templateUrl: './repayment-timeline.html',
  styleUrl: './repayment-timeline.css',
})
export class RepaymentTimeline {
  readonly timeline = input<RepaymentTimelineItem[]>([]);

  readonly title = input('Your repayment timeline');
}