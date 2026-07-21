import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css', '../login/login.css']
})
export class Register {
  credentials = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  showPassword = false;
  errorMessage = '';

  passwordScore = 0;
  strengthLabel = '';
  passwordFeedback = '';
  passwordMismatch = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  checkPasswordStrength(): void {
    const pwd = this.credentials.password;
    if (!pwd) {
      this.passwordScore = 0;
      this.strengthLabel = '';
      this.passwordFeedback = '';
      return;
    }

    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    this.passwordScore = score;

    const labels = ['Tres faible', 'Faible', 'Moyen', 'Fort', 'Tres fort'];
    const feedbacks = [
      'Ajoute au moins 8 caracteres',
      'Ajoute une majuscule et un chiffre',
      'Ajoute un caractere special pour plus de securite',
      'Bon mot de passe !',
      'Excellent mot de passe !'
    ];

    this.strengthLabel = labels[score];
    this.passwordFeedback = feedbacks[score];
  }

  isFormValid(): boolean {
    return !!(
      this.credentials.username &&
      this.credentials.email &&
      this.credentials.password &&
      this.credentials.confirmPassword &&
      this.credentials.password === this.credentials.confirmPassword &&
      this.passwordScore >= 2
    );
  }

  onRegister(): void {
    this.passwordMismatch = false;
    this.errorMessage = '';

    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    if (this.passwordScore < 2) {
      this.errorMessage = 'Le mot de passe est trop faible. Veuillez le renforcer.';
      return;
    }

    this.http.post('http://localhost:8080/api/auth/register', {
      username: this.credentials.username,
      email: this.credentials.email,
      password: this.credentials.password
    }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Erreur lors de l'inscription. Veuillez reessayer.";
        console.error(err);
      }
    });
  }
}