import { computed, Injectable, signal } from '@angular/core';
import { Debt } from '../models/debt';

@Injectable({ providedIn: 'root' })
export class DebtStore {
    private readonly debtState = signal<Debt[]>([
        {
            id: 'demo-1',
            name: 'Store account',
            balance: 2400,
            monthlyPayment: 400,
        },
        {
            id: 'demo-2',
            name: 'Credit card',
            balance: 8500,
            monthlyPayment: 750,
        },
        {
            id: 'demo-3',
            name: 'Personal loan',
            balance: 18000,
            monthlyPayment: 1200,
        },
    ]);

    readonly debts = this.debtState.asReadonly();

    readonly totalBalance = computed(() =>
        this.debts().reduce((total, debt) => total + debt.balance, 0)
    );

    readonly monthlyPayments = computed(() =>
        this.debts().reduce((total, debt) => total + debt.monthlyPayment, 0)
    );

    readonly orderedDebts = computed(() =>
        [...this.debts()]
            .filter(debt => debt.balance > 0)
            .sort((a, b) => a.balance - b.balance)
    );

    readonly nextTarget = computed(() => this.orderedDebts()[0] ?? null);

    save(value: Omit<Debt, 'id'>, existingId?: string): void {
        if (existingId) {
            this.debtState.update(debts =>
                debts.map(debt =>
                    debt.id === existingId ? { ...debt, ...value } : debt
                )
            );
            return;
        }

        this.debtState.update(debts => [
            ...debts,
            { ...value, id: crypto.randomUUID() },
        ]);
    }

    remove(id: string): void {
        this.debtState.update(debts => debts.filter(debt => debt.id !== id));
    }
}