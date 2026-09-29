import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  readonly icon = input('◎');
  readonly title = input('Nothing here yet');
  readonly description = input('Your information will appear here.');
  readonly actionLabel = input('');

  readonly action = output<void>();
}