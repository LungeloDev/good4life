import { Component, inject } from '@angular/core';
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

  draft = { ...this.store.profile() };

  continue(form: NgForm): void {
    if (form.invalid || !this.draft.fullName.trim()) {
      form.control.markAllAsTouched();
      return;
    }

    this.store.profile.set({
      fullName: this.draft.fullName.trim(),
      email: this.draft.email.trim(),
      phone: this.draft.phone.trim(),
    });

    void this.router.navigate(['/onboarding/income']);
  }
}