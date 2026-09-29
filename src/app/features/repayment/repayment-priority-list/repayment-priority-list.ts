import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';

export interface RepaymentPriorityItem {
  id: string;
  rank: number;
  name: string;
  creditor: string;
  balance: number;
  monthlyPayment: number;
  estimatedMonths: number | null;
  status: 'current' | 'next' | 'completed';
  reason?: string;
}

@Component({
  selector: 'app-repayment-priority-list',
  imports: [CurrencyPipe],
  templateUrl: './repayment-priority-list.html',
  styleUrl: './repayment-priority-list.css',
})
export class RepaymentPriorityList {
  readonly items = input<RepaymentPriorityItem[]>([]);

  readonly title = input('Your repayment priority');
  readonly subtitle = input(
    'Start with the debt that can create your next meaningful win.'
  );
}