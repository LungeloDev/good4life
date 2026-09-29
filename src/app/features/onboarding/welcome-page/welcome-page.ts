import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicHeader } from '../../../layout/public-header/public-header';

@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [RouterLink, PublicHeader],
  templateUrl: './welcome-page.html',
  styleUrl: '../onboarding.css',
})
export class WelcomePage { }