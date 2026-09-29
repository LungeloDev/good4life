import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Debt } from '../../../core/models/debt';

@Component({
  selector: 'app-debt-card',
  imports: [CurrencyPipe],
  templateUrl: './debt-card.html',
  styleUrl: './debt-card.css',
})
export class DebtCard {
  readonly debt = input.required<Debt>();
  readonly priority = input(false);

  readonly edit = output<Debt>();
  readonly remove = output<Debt>();
}