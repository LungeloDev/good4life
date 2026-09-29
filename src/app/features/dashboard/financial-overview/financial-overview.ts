import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-financial-overview',
  imports: [CurrencyPipe],
  templateUrl: './financial-overview.html',
  styleUrl: './financial-overview.css',
})
export class FinancialOverview {
  readonly totalBalance = input(0);
  readonly monthlyPayments = input(0);
  readonly debtCount = input(0);
}