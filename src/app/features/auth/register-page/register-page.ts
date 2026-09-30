import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { PublicHeader } from '../../../layout/public-header/public-header';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink, PublicHeader],
  templateUrl: './register-page.html',
  styleUrl: '../auth.css',
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly error = signal('');

  email = '';
  password = '';
  confirmPassword = '';

  async submit(form: NgForm): Promise<void> {
    if (form.invalid || this.submitting()) return;

    this.error.set('');

    if (this.password !== this.confirmPassword) {
      this.error.set('Your passwords do not match.');
      return;
    }

    this.submitting.set(true);

    try {
      await this.auth.register(this.email, this.password);
      await this.router.navigateByUrl('/onboarding/welcome');
    } catch (error) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}