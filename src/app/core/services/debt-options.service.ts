import { inject, Injectable } from '@angular/core';

import {
    doc,
    getDocFromServer,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';

import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';

export type AssessmentAnswer = 'yes' | 'no' | 'unknown';

export type CreditProvider =
    | 'unknown'
    | 'experian'
    | 'transunion'
    | 'clearscore'
    | 'bank'
    | 'other';

export interface DebtOptionsAssessment {
    creditScore: number | null;
    creditProvider: CreditProvider;
    providerDetail: string;
    creditReportDate: string | null;

    hasArrears: AssessmentAnswer;
    hasJudgments: AssessmentAnswer;
    underDebtReview: AssessmentAnswer;

    ownsHome: AssessmentAnswer;
    hasHomeLoan: AssessmentAnswer;

    homeLoanProvider: string;
    propertyValue: number | null;
    originalLoanAmount: number | null;
    homeLoanBalance: number | null;
    monthlyInstalment: number | null;
    annualInterestRate: number | null;
    remainingMonths: number | null;
}

export function emptyDebtOptions(): DebtOptionsAssessment {
    return {
        creditScore: null,
        creditProvider: 'unknown',
        providerDetail: '',
        creditReportDate: null,

        hasArrears: 'unknown',
        hasJudgments: 'unknown',
        underDebtReview: 'unknown',

        ownsHome: 'unknown',
        hasHomeLoan: 'unknown',

        homeLoanProvider: '',
        propertyValue: null,
        originalLoanAmount: null,
        homeLoanBalance: null,
        monthlyInstalment: null,
        annualInterestRate: null,
        remainingMonths: null,
    };
}

@Injectable({ providedIn: 'root' })
export class DebtOptionsService {
    private readonly auth = inject(AuthService);
    private readonly firebase = inject(FirebaseService);

    async load(): Promise<DebtOptionsAssessment | null> {
        const uid = await this.requireUid();

        const snapshot = await getDocFromServer(
            doc(this.firebase.firestore, 'users', uid, 'assessments', 'debt-options')
        );

        this.assertSameUser(uid);

        if (!snapshot.exists()) return null;

        const data = snapshot.data();

        // Explicit mapping excludes Firestore metadata from the form.
        return {
            creditScore: data['creditScore'] ?? null,
            creditProvider: data['creditProvider'] ?? 'unknown',
            providerDetail: data['providerDetail'] ?? '',
            creditReportDate: data['creditReportDate'] ?? null,

            hasArrears: data['hasArrears'] ?? 'unknown',
            hasJudgments: data['hasJudgments'] ?? 'unknown',
            underDebtReview: data['underDebtReview'] ?? 'unknown',

            ownsHome: data['ownsHome'] ?? 'unknown',
            hasHomeLoan: data['hasHomeLoan'] ?? 'unknown',

            homeLoanProvider: data['homeLoanProvider'] ?? '',
            propertyValue: data['propertyValue'] ?? null,
            originalLoanAmount: data['originalLoanAmount'] ?? null,
            homeLoanBalance: data['homeLoanBalance'] ?? null,
            monthlyInstalment: data['monthlyInstalment'] ?? null,
            annualInterestRate: data['annualInterestRate'] ?? null,
            remainingMonths: data['remainingMonths'] ?? null,
        };
    }

    async save(
        value: DebtOptionsAssessment
    ): Promise<DebtOptionsAssessment> {
        const uid = await this.requireUid();

        const data: DebtOptionsAssessment = {
            ...value,
            providerDetail: value.providerDetail.trim(),
            homeLoanProvider: value.homeLoanProvider.trim(),
            creditReportDate: value.creditReportDate || null,
        };

        // Do not retain irrelevant hidden home-loan fields.
        if (data.ownsHome !== 'yes') {
            data.hasHomeLoan = 'unknown';
            data.propertyValue = null;
        }

        if (data.ownsHome !== 'yes' || data.hasHomeLoan !== 'yes') {
            data.homeLoanProvider = '';
            data.originalLoanAmount = null;
            data.homeLoanBalance = null;
            data.monthlyInstalment = null;
            data.annualInterestRate = null;
            data.remainingMonths = null;
        }

        this.validate(data);

        await setDoc(
            doc(this.firebase.firestore, 'users', uid, 'assessments', 'debt-options'),
            {
                ...data,
                updatedAt: serverTimestamp(),
            }
        );

        this.assertSameUser(uid);

        return data;
    }

    private validate(data: DebtOptionsAssessment): void {
        const answers = ['yes', 'no', 'unknown'];

        for (const answer of [
            data.hasArrears,
            data.hasJudgments,
            data.underDebtReview,
            data.ownsHome,
            data.hasHomeLoan,
        ]) {
            if (!answers.includes(answer)) {
                throw new Error('Select a valid answer for each question.');
            }
        }

        if (
            !['unknown', 'experian', 'transunion', 'clearscore', 'bank', 'other']
                .includes(data.creditProvider)
        ) {
            throw new Error('Select a valid credit-score source.');
        }

        if (data.creditScore !== null) {
            if (
                !Number.isSafeInteger(data.creditScore) ||
                data.creditScore < 0 ||
                data.creditScore > 10000
            ) {
                throw new Error('Enter the numeric score shown by your provider.');
            }

            if (data.creditProvider === 'unknown') {
                throw new Error('Select where you checked your credit score.');
            }
        }

        if (
            ['bank', 'other'].includes(data.creditProvider) &&
            !data.providerDetail
        ) {
            throw new Error('Enter the bank or other provider name.');
        }

        if (
            data.providerDetail.length > 120 ||
            data.homeLoanProvider.length > 120
        ) {
            throw new Error('Provider names must be 120 characters or fewer.');
        }

        if (
            data.creditReportDate !== null &&
            !/^\d{4}-\d{2}-\d{2}$/.test(data.creditReportDate)
        ) {
            throw new Error('Enter a valid report date.');
        }

        for (const amount of [
            data.propertyValue,
            data.originalLoanAmount,
            data.homeLoanBalance,
            data.monthlyInstalment,
        ]) {
            if (
                amount !== null &&
                (!Number.isFinite(amount) || amount < 0 || amount > 1e12)
            ) {
                throw new Error('Enter valid amounts of zero or more.');
            }
        }

        if (
            data.annualInterestRate !== null &&
            (
                !Number.isFinite(data.annualInterestRate) ||
                data.annualInterestRate < 0 ||
                data.annualInterestRate > 100
            )
        ) {
            throw new Error('Enter an annual interest rate between 0 and 100%.');
        }

        if (
            data.remainingMonths !== null &&
            (
                !Number.isInteger(data.remainingMonths) ||
                data.remainingMonths < 1 ||
                data.remainingMonths > 600
            )
        ) {
            throw new Error('Enter a remaining term between 1 and 600 months.');
        }
    }

    private async requireUid(): Promise<string> {
        await this.auth.waitUntilReady();

        const uid = this.firebase.auth.currentUser?.uid;

        if (!uid) throw new Error('Please sign in to continue.');

        return uid;
    }

    private assertSameUser(uid: string): void {
        if (this.firebase.auth.currentUser?.uid !== uid) {
            throw new Error('Your account changed. Please reload this page.');
        }
    }
}