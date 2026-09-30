import { Component, inject, signal } from '@angular/core';
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
  readonly saving = signal(false);
  readonly saveError = signal('');

  accepted = this.store.consentAccepted();

  async continue(): Promise<void> {
  if (!this.accepted || this.saving()) return;

  this.saveError.set('');
  this.saving.set(true);

  try {
    await this.store.saveConsent();
    await this.router.navigate(['/onboarding/profile']);
  } catch {
    this.saveError.set(
      'Could not save your acknowledgement. Please try again.'
    );
  } finally {
    this.saving.set(false);
  }
}
}