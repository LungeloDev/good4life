import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Debt } from '../../../core/models/debt';

@Component({
  selector: 'app-next-target-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './next-target-card.html',
  styleUrl: './next-target-card.css',
})
export class NextTargetCard {
  readonly debt = input<Debt | null>(null);
}