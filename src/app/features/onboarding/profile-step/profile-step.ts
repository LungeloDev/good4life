import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { OnboardingStore } from '../../../core/services/onboarding-store';
import { PublicHeader } from '../../../layout/public-header/public-header';
import { StepIndicator } from '../../../shared/step-indicator/step-indicator';

@Component({
  selector: 'app-profile-step',
  standalone: true,
  imports: [FormsModule, RouterLink, PublicHeader, StepIndicator],
  templateUrl: './profile-step.html',
  styleUrl: '../onboarding.css',
})
export class ProfileStep {
  private readonly store = inject(OnboardingStore);
  private readonly router = inject(Router);
  readonly saving = signal(false);
  readonly saveError = signal('');

  draft = { ...this.store.profile() };

  async continue(form: NgForm): Promise<void> {
  if (this.saving()) return;

  if (form.invalid || !this.draft.fullName.trim()) {
    form.control.markAllAsTouched();
    return;
  }

  this.saveError.set('');
  this.saving.set(true);

  try {
    await this.store.saveProfile(this.draft);
    await this.router.navigate(['/onboarding/income']);
  } catch {
    this.saveError.set(
      'Could not save your profile. Please try again.'
    );
  } finally {
    this.saving.set(false);
  }
}
}