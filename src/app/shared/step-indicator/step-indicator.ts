import { Component, input } from '@angular/core';

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  templateUrl: './step-indicator.html',
  styleUrl: './step-indicator.css',
})
export class StepIndicator {
  readonly steps = input<string[]>([
    'Consent',
    'Profile',
    'Income',
    'Complete',
  ]);

  readonly currentStep = input(1);
}