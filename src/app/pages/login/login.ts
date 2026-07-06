import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,  RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  identifier = '';
  password = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';

    this.auth.login(this.identifier, this.password).subscribe({
      next: (response) => {
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/game']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error ?? 'Identifiants invalides.';
      }
    });
  }
}