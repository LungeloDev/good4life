import { Component, inject, Input, output } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Debt, DebtDraft } from '../../../core/models/debt';

@Component({
  selector: 'app-debt-form',
  imports: [ReactiveFormsModule],
  templateUrl: './debt-form.html',
  styleUrl: './debt-form.css',
})
export class DebtForm {
  private readonly formBuilder = inject(FormBuilder);

  readonly debtAdded = output<DebtDraft>();
  readonly cancelled = output<void>();

  editing = false;

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    balance: [0, [Validators.required, Validators.min(0.01)]],
    monthlyPayment: [0, [Validators.required, Validators.min(0.01)]],
  });

  @Input() set debt(value: Debt | null) {
    this.editing = value !== null;

    this.form.reset({
      name: value?.name ?? '',
      balance: value?.balance ?? 0,
      monthlyPayment: value?.monthlyPayment ?? 0,
    });
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();

    this.debtAdded.emit({
      name: value.name.trim(),
      balance: Number(value.balance),
      monthlyPayment: Number(value.monthlyPayment),
    });
  }
}