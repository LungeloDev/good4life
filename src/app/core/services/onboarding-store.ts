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
    doc,
    onSnapshot,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';

import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';

export interface OnboardingProfile {
    fullName: string;
    email: string;
    phone: string;
}

export interface OnboardingIncome {
    monthlyIncome: number;
    monthlyExpenses: number;
}

@Injectable({ providedIn: 'root' })
export class OnboardingStore {
    private readonly firebase = inject(FirebaseService);
    private readonly auth = inject(AuthService);
    private readonly zone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);

    readonly consentAccepted = signal(false);

    readonly profile = signal<OnboardingProfile>({
        fullName: '',
        email: '',
        phone: '',
    });

    readonly income = signal<OnboardingIncome>({
        monthlyIncome: 0,
        monthlyExpenses: 0,
    });

    readonly incomeEntered = signal(false);
    readonly loading = signal(true);
    readonly error = signal('');

    readonly remainingBeforeDebtPayments = computed(() =>
        this.income().monthlyIncome - this.income().monthlyExpenses
    );

    readonly complete = computed(() =>
        this.consentAccepted() &&
        this.profile().fullName.trim().length > 0 &&
        this.profile().email.trim().length > 0 &&
        this.incomeEntered()
    );

    private ownerUid: string | null | undefined;
    private stopDocument?: () => void;
    private ready: Promise<void> = Promise.resolve();
    private finishReady: () => void = () => { };

    constructor() {
        const stopAuth = onAuthStateChanged(
            this.firebase.auth,
            user => this.zone.run(() => this.connect(user?.uid ?? null))
        );

        this.destroyRef.onDestroy(() => {
            stopAuth();
            this.stopDocument?.();
            this.finishReady();
        });
    }

    async load(): Promise<void> {
        await this.auth.waitUntilReady();

        const uid = this.firebase.auth.currentUser?.uid;
        if (!uid) throw new Error('Please sign in to continue.');

        this.connect(uid);
        await this.ready;

        if (
            this.ownerUid !== uid ||
            this.firebase.auth.currentUser?.uid !== uid
        ) {
            throw new Error('Your account changed. Please try again.');
        }

        if (this.error()) throw new Error(this.error());
    }

    async saveConsent(): Promise<void> {
        await this.write({
            consentAccepted: true,
            consentAcceptedAt: serverTimestamp(),
        });
    }

    async saveProfile(value: OnboardingProfile): Promise<void> {
        const profile = {
            fullName: value.fullName.trim(),
            email: value.email.trim(),
            phone: value.phone.trim(),
        };

        if (!profile.fullName || !profile.email) {
            throw new Error('Enter your name and email address.');
        }

        await this.write({ profile });
    }

    async saveIncome(value: OnboardingIncome): Promise<void> {
        if (
            !Number.isFinite(value.monthlyIncome) ||
            !Number.isFinite(value.monthlyExpenses) ||
            value.monthlyIncome < 0 ||
            value.monthlyExpenses < 0
        ) {
            throw new Error('Enter valid income and expense amounts.');
        }

        await this.write({
            income: {
                monthlyIncome: value.monthlyIncome,
                monthlyExpenses: value.monthlyExpenses,
            },
            incomeEntered: true,
        });
    }

    private async write(data: Record<string, unknown>): Promise<void> {
        await this.load();

        const uid = this.firebase.auth.currentUser?.uid;
        if (!uid) throw new Error('Please sign in to continue.');

        await setDoc(
            doc(this.firebase.firestore, 'users', uid),
            {
                ...data,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        if (this.firebase.auth.currentUser?.uid !== uid) {
            throw new Error('Your account changed. Please sign in again.');
        }
    }

    private connect(uid: string | null): void {
        if (this.ownerUid === uid) return;

        this.stopDocument?.();
        this.stopDocument = undefined;
        this.finishReady();
        this.ownerUid = uid;

        this.consentAccepted.set(false);
        this.profile.set({ fullName: '', email: '', phone: '' });
        this.income.set({ monthlyIncome: 0, monthlyExpenses: 0 });
        this.incomeEntered.set(false);
        this.error.set('');
        this.loading.set(uid !== null);

        if (!uid) {
            this.ready = Promise.resolve();
            return;
        }

        this.ready = new Promise<void>(resolve => {
            this.finishReady = resolve;
        });

        const finish = this.finishReady;

        this.stopDocument = onSnapshot(
            doc(this.firebase.firestore, 'users', uid),
            snapshot => {
                if (this.ownerUid !== uid) return;

                this.zone.run(() => {
                    const data = snapshot.data();

                    this.consentAccepted.set(data?.['consentAccepted'] === true);

                    this.profile.set({
                        fullName: data?.['profile']?.fullName ?? '',
                        email: data?.['profile']?.email ?? '',
                        phone: data?.['profile']?.phone ?? '',
                    });

                    this.income.set({
                        monthlyIncome: data?.['income']?.monthlyIncome ?? 0,
                        monthlyExpenses: data?.['income']?.monthlyExpenses ?? 0,
                    });

                    this.incomeEntered.set(data?.['incomeEntered'] === true);
                    this.loading.set(false);
                    this.error.set('');
                    finish();
                });
            },
            () => {
                if (this.ownerUid !== uid) return;

                this.zone.run(() => {
                    this.error.set(
                        'Could not load your profile. Check your connection and Firestore rules, then refresh.'
                    );
                    this.loading.set(false);
                    finish();
                });
            }
        );
    }
}