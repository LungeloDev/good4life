import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { OnboardingStore } from '../../../core/services/onboarding-store';
import { PublicHeader } from '../../../layout/public-header/public-header';
import { StepIndicator } from '../../../shared/step-indicator/step-indicator';

@Component({
  selector: 'app-consent-step',
  standalone: true,
  imports: [FormsModule, RouterLink, PublicHeader, StepIndicator],
  templateUrl: './consent-step.html',
  styleUrl: '../onboarding.css',
})
export class ConsentStep {
  private readonly store = inject(OnboardingStore);
  private readonly router = inject(Router);

  accepted = this.store.consentAccepted();

  continue(): void {
    if (!this.accepted) return;

    this.store.consentAccepted.set(true);
    void this.router.navigate(['/onboarding/profile']);
  }
}