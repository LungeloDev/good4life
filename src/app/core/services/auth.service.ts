import {
    computed,
    DestroyRef,
    inject,
    Injectable,
    NgZone,
    signal,
} from '@angular/core';

import { FirebaseError } from 'firebase/app';

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User,
} from 'firebase/auth';

import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly firebase = inject(FirebaseService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly zone = inject(NgZone);

    private readonly userState = signal<User | null>(null);
    private readonly loadingState = signal(true);

    readonly user = this.userState.asReadonly();
    readonly loading = this.loadingState.asReadonly();
    readonly isAuthenticated = computed(() => this.user() !== null);

    constructor() {
        const unsubscribe = onAuthStateChanged(
            this.firebase.auth,
            user => {
                this.zone.run(() => {
                    this.userState.set(user);
                    this.loadingState.set(false);
                });
            }
        );

        this.destroyRef.onDestroy(unsubscribe);
    }

    async waitUntilReady(): Promise<void> {
        await this.firebase.auth.authStateReady();

        this.userState.set(this.firebase.auth.currentUser);
        this.loadingState.set(false);
    }

    async register(email: string, password: string): Promise<void> {
        const credential = await createUserWithEmailAndPassword(
            this.firebase.auth,
            email.trim(),
            password
        );

        this.userState.set(credential.user);
    }

    async login(email: string, password: string): Promise<void> {
        const credential = await signInWithEmailAndPassword(
            this.firebase.auth,
            email.trim(),
            password
        );

        this.userState.set(credential.user);
    }

    async logout(): Promise<void> {
        await signOut(this.firebase.auth);
        this.userState.set(null);
    }

    errorMessage(error: unknown): string {
        if (!(error instanceof FirebaseError)) {
            return 'Something went wrong. Please try again.';
        }

        switch (error.code) {
            case 'auth/invalid-email':
                return 'Enter a valid email address.';

            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'The email or password is incorrect.';

            case 'auth/email-already-in-use':
                return 'An account already exists with this email. Please sign in.';

            case 'auth/weak-password':
            case 'auth/password-does-not-meet-requirements':
                return 'Your password does not meet the account requirements.';

            case 'auth/too-many-requests':
                return 'Too many attempts. Please wait and try again.';

            case 'auth/network-request-failed':
                return 'Check your internet connection and try again.';

            case 'auth/user-disabled':
                return 'This account has been disabled.';

            case 'auth/operation-not-allowed':
                return 'Email/password sign-in is not enabled in Firebase.';

            default:
                return 'Unable to complete the request. Please try again.';
        }
    }
}