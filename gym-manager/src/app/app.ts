import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KioskoComponent } from './features/kiosko/kiosko/kiosko';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, KioskoComponent],
  template: `
    @if (isKiosko) {
      <app-kiosko></app-kiosko>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
})
export class App {
  protected readonly title = signal('gym-manager');
  isKiosko = window.location.pathname === '/kiosko' || window.location.hash === '#/kiosko';
}
