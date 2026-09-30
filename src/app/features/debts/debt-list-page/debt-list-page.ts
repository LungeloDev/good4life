import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Debt } from '../../../core/models/debt';
import { DebtStore } from '../../../core/services/debt-store';

import { PageHeader } from '../../../shared/page-header/page-header';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import {
  ConfirmationDialog,
} from '../../../shared/confirmation-dialog/confirmation-dialog';

import { DebtCard } from '../debt-card/debt-card';
import { DebtSummary } from '../debt-summary/debt-summary';

import { LoadingState } from '../../../shared/loading-state/loading-state';

@Component({
  selector: 'app-debt-list-page',
  standalone: true,
  imports: [
    FormsModule,
    PageHeader,
    EmptyState,
    ConfirmationDialog,
    DebtCard,
    DebtSummary,
    LoadingState
  ],
  templateUrl: './debt-list-page.html',
  styleUrl: './debt-list-page.css',
})
export class DebtListPage {
  readonly store = inject(DebtStore);

  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly pendingRemoval = signal<Debt | null>(null);
  readonly formError = signal('');
  readonly announcement = signal('');

  readonly saving = signal(false);
  readonly removing = signal(false);
  readonly actionError = signal('');

  draft = this.emptyDraft();

  openAdd(): void {
    this.editingId.set(null);
    this.draft = this.emptyDraft();
    this.formError.set('');
    this.formOpen.set(true);
  }

  openEdit(debt: Debt): void {
    this.editingId.set(debt.id);
    this.draft = {
      name: debt.name,
      balance: debt.balance,
      monthlyPayment: debt.monthlyPayment,
    };
    this.formError.set('');
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.formError.set('');
  }

  async saveDebt(): Promise<void> {
    if (this.saving()) return;

    const name = this.draft.name.trim();
    const balance = this.draft.balance;
    const monthlyPayment = this.draft.monthlyPayment;

    if (!name) {
      this.formError.set('Enter a name for this debt.');
      return;
    }

    if (
      balance === null ||
      !Number.isFinite(balance) ||
      balance < 0
    ) {
      this.formError.set('Enter a valid balance of zero or more.');
      return;
    }

    if (
      monthlyPayment === null ||
      !Number.isFinite(monthlyPayment) ||
      monthlyPayment < 0
    ) {
      this.formError.set('Enter a valid monthly payment of zero or more.');
      return;
    }

    this.formError.set('');
    this.saving.set(true);

    const updating = this.editingId() !== null;

    try {
      await this.store.save(
        { name, balance, monthlyPayment },
        this.editingId() ?? undefined
      );

      this.closeForm();
      this.announcement.set(updating ? 'Debt updated.' : 'Debt added.');
    } catch {
      this.formError.set(
        'Could not save this debt. Check your connection and try again.'
      );
    } finally {
      this.saving.set(false);
    }
  }

  async confirmRemoval(): Promise<void> {
    const debt = this.pendingRemoval();
    if (!debt || this.removing()) return;

    this.actionError.set('');
    this.removing.set(true);

    try {
      await this.store.remove(debt.id);

      if (this.editingId() === debt.id) {
        this.closeForm();
      }

      this.announcement.set(`${debt.name} removed from your overview.`);
    } catch {
      this.actionError.set(
        'Could not remove this debt. Check your connection and try again.'
      );
    } finally {
      this.pendingRemoval.set(null);
      this.removing.set(false);
    }
  }

  private emptyDraft(): {
    name: string;
    balance: number | null;
    monthlyPayment: number | null;
  } {
    return {
      name: '',
      balance: null,
      monthlyPayment: null,
    };
  }
}