import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="router-wrapper">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .router-wrapper {
      min-height: 100vh;
    }
  `]
})
export class App {}