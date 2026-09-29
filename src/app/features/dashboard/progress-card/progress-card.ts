import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-card',
  imports: [CurrencyPipe],
  templateUrl: './progress-card.html',
  styleUrl: './progress-card.css',
})
export class ProgressCard {
  readonly targetName = input('First target');
  readonly targetAmount = input(0);
  readonly paidAmount = input(0);

  readonly percentage = computed(() => {
    const target = this.targetAmount();
    if (target <= 0) return 0;

    return Math.min(
      100,
      Math.max(0, Math.round((this.paidAmount() / target) * 100))
    );
  });
}