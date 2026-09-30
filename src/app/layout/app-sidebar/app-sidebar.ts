import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.html',
  styleUrl: './app-sidebar.css',
})
export class AppSidebar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly signingOut = signal(false);
  readonly logoutError = signal('');

  async logout(): Promise<void> {
    if (this.signingOut()) return;

    this.signingOut.set(true);
    this.logoutError.set('');

    try {
      await this.auth.logout();
      await this.router.navigateByUrl('/login');
    } catch {
      this.logoutError.set('Could not sign out. Please try again.');
    } finally {
      this.signingOut.set(false);
    }
  }
  readonly links = [
    { label: 'Dashboard', path: '/dashboard', icon: '▦' },
    { label: 'My Debts', path: '/debts', icon: '↗' },
    { label: 'Repayment Plan', path: '/repayment-plan', icon: '◎' },
  ];
}