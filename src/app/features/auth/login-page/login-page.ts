import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);

  readonly showPassword = signal(false);
  readonly showAuthNotice = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    this.showAuthNotice.set(false);

    if (this.form.invalid) {
      return;
    }

    // Connect your authentication service here.
    // Do not navigate to the private dashboard without a successful sign-in.
    this.showAuthNotice.set(true);
  }
}