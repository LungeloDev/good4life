import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.html',
  styleUrl: './app-sidebar.css',
})
export class AppSidebar {
  readonly links = [
    { label: 'Dashboard', path: '/dashboard', icon: '▦' },
    { label: 'My Debts', path: '/debts', icon: '↗' },
    { label: 'Repayment Plan', path: '/repayment-plan', icon: '◎' },
  ];
}