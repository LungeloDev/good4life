import {
    computed,
    DestroyRef,
    inject,
    Injectable,
    NgZone,
    signal,
} from '@angular/core';

import { onAuthStateChanged } from 'firebase/auth';

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';

import { Debt } from '../models/debt';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class DebtStore {
    private readonly firebase = inject(FirebaseService);
    private readonly auth = inject(AuthService);
    private readonly zone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);

    private readonly debtState = signal<Debt[]>([]);

    readonly debts = this.debtState.asReadonly();
    readonly loading = signal(true);
    readonly error = signal('');

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

    private ownerUid: string | null | undefined;
    private stopDebts?: () => void;

    constructor() {
        const stopAuth = onAuthStateChanged(
            this.firebase.auth,
            user => this.zone.run(() => this.connect(user?.uid ?? null))
        );

        this.destroyRef.onDestroy(() => {
            stopAuth();
            this.stopDebts?.();
        });
    }

    async save(value: Omit<Debt, 'id'>, existingId?: string): Promise<void> {
        const uid = await this.requireUid();

        const name = value.name.trim();

        if (
            !name ||
            name.length > 120 ||
            !Number.isFinite(value.balance) ||
            !Number.isFinite(value.monthlyPayment) ||
            value.balance < 0 ||
            value.monthlyPayment < 0
        ) {
            throw new Error('Enter a debt name and valid amounts of zero or more.');
        }

        const data = {
            name,
            balance: Math.round(value.balance * 100) / 100,
            monthlyPayment: Math.round(value.monthlyPayment * 100) / 100,
            updatedAt: serverTimestamp(),
        };

        if (existingId) {
            await updateDoc(
                doc(this.firebase.firestore, 'users', uid, 'debts', existingId),
                data
            );
        } else {
            await addDoc(
                collection(this.firebase.firestore, 'users', uid, 'debts'),
                {
                    ...data,
                    createdAt: serverTimestamp(),
                }
            );
        }

        this.assertSameUser(uid);
    }

    async remove(id: string): Promise<void> {
        const uid = await this.requireUid();

        await deleteDoc(
            doc(this.firebase.firestore, 'users', uid, 'debts', id)
        );

        this.assertSameUser(uid);
    }

    private async requireUid(): Promise<string> {
        await this.auth.waitUntilReady();

        const uid = this.firebase.auth.currentUser?.uid;
        if (!uid) throw new Error('Please sign in to continue.');

        return uid;
    }

    private assertSameUser(uid: string): void {
        if (this.firebase.auth.currentUser?.uid !== uid) {
            throw new Error('Your account changed. Please sign in again.');
        }
    }

    private connect(uid: string | null): void {
        if (this.ownerUid === uid) return;

        this.stopDebts?.();
        this.stopDebts = undefined;
        this.ownerUid = uid;

        this.debtState.set([]);
        this.error.set('');
        this.loading.set(uid !== null);

        if (!uid) return;

        this.stopDebts = onSnapshot(
            collection(this.firebase.firestore, 'users', uid, 'debts'),
            snapshot => {
                if (this.ownerUid !== uid) return;

                this.zone.run(() => {
                    this.debtState.set(
                        snapshot.docs
                            .map(document => {
                                const data = document.data();

                                return {
                                    id: document.id,
                                    name: data['name'] as string,
                                    balance: data['balance'] as number,
                                    monthlyPayment: data['monthlyPayment'] as number,
                                };
                            })
                            .sort((a, b) => a.name.localeCompare(b.name))
                    );

                    this.loading.set(false);
                    this.error.set('');
                });
            },
            () => {
                if (this.ownerUid !== uid) return;

                this.zone.run(() => {
                    this.debtState.set([]);
                    this.loading.set(false);
                    this.error.set(
                        'Could not load your debts. Check your connection and Firestore rules, then refresh.'
                    );
                });
            }
        );
    }
}