import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './public-header.html',
  styleUrl: './public-header.css',
})
export class PublicHeader {
  readonly showAction = input(true);
  readonly actionLabel = input('Get started');
  readonly actionRoute = input('/onboarding/consent');
}