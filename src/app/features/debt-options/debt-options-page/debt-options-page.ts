import { CurrencyPipe } from '@angular/common';

import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';

import {
  DebtOptionsAssessment,
  DebtOptionsService,
  emptyDebtOptions,
} from '../../../core/services/debt-options.service';

import { DebtStore } from '../../../core/services/debt-store';
import { PageHeader } from '../../../shared/page-header/page-header';
import { LoadingState } from '../../../shared/loading-state/loading-state';

@Component({
  selector: 'app-debt-options-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    RouterLink,
    PageHeader,
    LoadingState,
  ],
  templateUrl: './debt-options-page.html',
  styleUrl: './debt-options-page.css',
})
export class DebtOptionsPage implements OnInit, OnDestroy {
  private readonly service = inject(DebtOptionsService);
  readonly debtStore = inject(DebtStore);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
  readonly success = signal('');

  readonly savedAssessment = signal<DebtOptionsAssessment | null>(null);

  draft = emptyDebtOptions();

  private alive = true;

  readonly providers = [
    { value: 'unknown', label: 'Not checked / not sure' },
    { value: 'experian', label: 'Experian' },
    { value: 'transunion', label: 'TransUnion' },
    { value: 'clearscore', label: 'ClearScore' },
    { value: 'bank', label: 'Banking app' },
    { value: 'other', label: 'Other provider' },
  ];

  readonly answers = [
    { value: 'unknown', label: 'Not sure' },
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  readonly today = this.localDate();

  readonly needsReview = computed(() => {
    const value = this.savedAssessment();

    return value !== null && (
      value.hasArrears === 'yes' ||
      value.hasJudgments === 'yes' ||
      value.underDebtReview === 'yes'
    );
  });

  readonly creditStatusUnknown = computed(() => {
    const value = this.savedAssessment();

    return value !== null && (
      value.hasArrears === 'unknown' ||
      value.hasJudgments === 'unknown' ||
      value.underDebtReview === 'unknown'
    );
  });

  readonly readvanceIllustration = computed<number | null>(() => {
    const value = this.savedAssessment();

    if (
      !value ||
      value.ownsHome !== 'yes' ||
      value.hasHomeLoan !== 'yes' ||
      value.originalLoanAmount === null ||
      value.homeLoanBalance === null
    ) {
      return null;
    }

    return Math.max(
      0,
      value.originalLoanAmount - value.homeLoanBalance
    );
  });

  readonly equityIllustration = computed<number | null>(() => {
    const value = this.savedAssessment();

    if (!value || value.ownsHome !== 'yes' || value.propertyValue === null) {
      return null;
    }

    if (value.hasHomeLoan === 'no') {
      return value.propertyValue;
    }

    if (value.hasHomeLoan !== 'yes' || value.homeLoanBalance === null) {
      return null;
    }

    return Math.max(0, value.propertyValue - value.homeLoanBalance);
  });

  ngOnInit(): void {
    void this.load();
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');

    try {
      const value = await this.service.load();

      if (!this.alive) return;

      this.savedAssessment.set(value);
      this.draft = value ? { ...value } : emptyDebtOptions();
    } catch (error) {
      if (!this.alive) return;

      this.loadError.set(this.message(error));
    } finally {
      if (this.alive) this.loading.set(false);
    }
  }

  async submit(form: NgForm): Promise<void> {
    if (this.saving()) return;

    this.saveError.set('');
    this.success.set('');

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.saveError.set('Check the highlighted form fields.');
      return;
    }

    if (
      this.draft.creditReportDate &&
      this.draft.creditReportDate > this.today
    ) {
      this.saveError.set('The credit-report date cannot be in the future.');
      return;
    }

    this.saving.set(true);

    try {
      const saved = await this.service.save({ ...this.draft });

      if (!this.alive) return;

      this.draft = { ...saved };
      this.savedAssessment.set(saved);
      this.success.set('Assessment saved. Your results are updated below.');
      form.form.markAsPristine();
    } catch (error) {
      if (this.alive) this.saveError.set(this.message(error));
    } finally {
      if (this.alive) this.saving.set(false);
    }
  }

  providerLabel(value: DebtOptionsAssessment): string {
    const label = this.providers.find(
      provider => provider.value === value.creditProvider
    )?.label ?? 'Not specified';

    return value.providerDetail
      ? `${label}: ${value.providerDetail}`
      : label;
  }

  private message(error: unknown): string {
    if (error instanceof FirebaseError) {
      if (error.code === 'permission-denied') {
        return 'Access denied. Check that the assessment security rule is published.';
      }

      return 'Could not reach the database. Check your connection and try again.';
    }

    return error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again.';
  }

  private localDate(): string {
    const date = new Date();

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}