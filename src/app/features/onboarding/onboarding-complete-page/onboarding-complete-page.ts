import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OnboardingStore } from '../../../core/services/onboarding-store';
import { PublicHeader } from '../../../layout/public-header/public-header';
import { StepIndicator } from '../../../shared/step-indicator/step-indicator';

@Component({
  selector: 'app-onboarding-complete-page',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, PublicHeader, StepIndicator],
  templateUrl: './onboarding-complete-page.html',
  styleUrl: '../onboarding.css',
})
export class OnboardingCompletePage {
  readonly store = inject(OnboardingStore);
}