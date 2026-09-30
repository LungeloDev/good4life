import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { PublicHeader } from '../../../layout/public-header/public-header';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, PublicHeader],
  templateUrl: './login-page.html',
  styleUrl: '../auth.css',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly error = signal(
    this.route.snapshot.queryParamMap.get('dataError') === 'true'
      ? 'Your saved details could not be loaded. Check your connection and Firestore rules, then sign in again.'
      : ''
  );

  email = '';
  password = '';

  async submit(form: NgForm): Promise<void> {
    if (form.invalid || this.submitting()) return;

    this.error.set('');
    this.submitting.set(true);

    try {
      await this.auth.login(this.email, this.password);

      const requestedUrl = this.route.snapshot.queryParamMap.get('returnUrl');

      const destination =
        requestedUrl?.startsWith('/') &&
          !requestedUrl.startsWith('//') &&
          !requestedUrl.includes('\\')
          ? requestedUrl
          : '/dashboard';

      await this.router.navigateByUrl(destination);
    } catch (error) {
      this.error.set(this.auth.errorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}