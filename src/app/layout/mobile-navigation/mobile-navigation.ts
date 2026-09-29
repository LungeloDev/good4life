import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-navigation.html',
  styleUrl: './mobile-navigation.css',
})
export class MobileNavigation {
  readonly links = [
    { label: 'Dashboard', path: '/dashboard', icon: '▦' },
    { label: 'My Debts', path: '/debts', icon: '↗' },
    { label: 'My Plan', path: '/repayment-plan', icon: '◎' },
  ];
}