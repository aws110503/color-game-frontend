import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    const confirmed = confirm('Voulez-vous vraiment vous déconnecter ?');
    if (confirmed) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }

  goToGame() {
    this.router.navigate(['/color-game']);
  }
}