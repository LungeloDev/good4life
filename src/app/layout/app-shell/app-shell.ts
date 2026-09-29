import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSidebar } from '../app-sidebar/app-sidebar';
import { MobileNavigation } from '../mobile-navigation/mobile-navigation';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [RouterOutlet, AppSidebar, MobileNavigation],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell { }