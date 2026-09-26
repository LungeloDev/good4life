import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  readonly menuOpen = signal(false);

  readonly steps = [
    {
      number: '01',
      title: 'Start with your picture',
      description:
        'Add your income and debts in one place so you can see what you are working with.',
    },
    {
      number: '02',
      title: 'Choose a clear next step',
      description:
        'See your balances together and identify a manageable debt to focus on first.',
    },
    {
      number: '03',
      title: 'Follow your plan',
      description:
        'Explore an illustrative repayment plan and keep track of your progress.',
    },
  ];

  readonly features = [
    {
      number: '01',
      title: 'One view of your debts',
      description:
        'Bring the debts you enter into a single, easy-to-read overview.',
    },
    {
      number: '02',
      title: 'A practical starting point',
      description:
        'See a suggested order for tackling your balances, starting with a smaller debt.',
    },
    {
      number: '03',
      title: 'Progress you can follow',
      description:
        'View your next target and an illustrative path towards reducing what you owe.',
    },
  ];

  readonly faqs = [
    {
      question: 'Do I need a credit report to get started?',
      answer:
        'No. The current experience starts with debts you enter yourself. Credit bureau connections are part of a future product phase.',
    },
    {
      question: 'Is the repayment plan financial advice?',
      answer:
        'No. It is an illustrative planning tool based on the information and assumptions used in the app. It does not replace advice tailored to your circumstances.',
    },
    {
      question: 'Can I use GooD4Life on my phone?',
      answer:
        'Yes. The web experience is designed to work in both mobile and desktop browsers.',
    },
  ];

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}