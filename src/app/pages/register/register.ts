import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../auth';
import zxcvbn from 'zxcvbn';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  username = '';
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  passwordScore = 0;
  passwordFeedback = '';
  passwordLabel = '';

  constructor(private auth: AuthService, private router: Router) {}

onPasswordChange() {
  if (!this.password) {
    this.passwordScore = 0;
    this.passwordFeedback = '';
    this.passwordLabel = '';
    return;
  }

  const result = zxcvbn(this.password);
  this.passwordScore = result.score;

  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  this.passwordLabel = labels[this.passwordScore];

  const rawMessage = result.feedback.warning || result.feedback.suggestions[0] || '';
  this.passwordFeedback = this.translateFeedback(rawMessage);
}

private translateFeedback(message: string): string {
  const translations: Record<string, string> = {
    'This is a top-10 common password': 'Ce mot de passe fait partie des 10 mots de passe les plus courants',
    'This is a top-100 common password': 'Ce mot de passe fait partie des 100 mots de passe les plus courants',
    'This is a very common password': 'Ce mot de passe est très courant',
    'This is similar to a commonly used password': 'Ce mot de passe ressemble à un mot de passe très courant',
    'A word by itself is easy to guess': 'Un seul mot est facile à deviner',
    'Names and surnames by themselves are easy to guess': 'Les noms et prénoms seuls sont faciles à deviner',
    'Common names and surnames are easy to guess': 'Les noms courants sont faciles à deviner',
    'Straight rows of keys are easy to guess': 'Les touches alignées sur le clavier sont faciles à deviner',
    'Short keyboard patterns are easy to guess': 'Les motifs courts du clavier sont faciles à deviner',
    'Repeats like "aaa" are easy to guess': 'Les répétitions comme "aaa" sont faciles à deviner',
    'Repeats like "abcabcabc" are only slightly harder to guess than "abc"': 'Les répétitions comme "abcabcabc" sont presque aussi faciles à deviner que "abc"',
    'Sequences like "abc" or "6543" are easy to guess': 'Les séquences comme "abc" ou "6543" sont faciles à deviner',
    'Recent years are easy to guess': 'Les années récentes sont faciles à deviner',
    'Dates are often easy to guess': 'Les dates sont souvent faciles à deviner',
    'Add another word or two. Uncommon words are better.': 'Ajoutez un ou deux mots supplémentaires. Les mots peu courants sont préférables.',
    'Capitalization doesn\'t help very much': 'Les majuscules n\'aident pas beaucoup',
    'All-uppercase is almost as easy to guess as all-lowercase': 'Tout en majuscules est presque aussi facile à deviner que tout en minuscules',
    'Reversed words aren\'t much harder to guess': 'Les mots inversés ne sont pas beaucoup plus difficiles à deviner',
    'Predictable substitutions like \'@\' instead of \'a\' don\'t help very much': 'Les substitutions prévisibles comme \'@\' pour \'a\' n\'aident pas beaucoup',
    'Use a few words, avoid common phrases': 'Utilisez plusieurs mots, évitez les phrases courantes',
    'No need for symbols, digits, or uppercase letters': 'Pas besoin de symboles, chiffres ou majuscules',
    'Avoid repeated words and characters': 'Évitez les mots et caractères répétés',
    'Avoid sequences': 'Évitez les séquences',
    'Avoid recent years': 'Évitez les années récentes',
    'Avoid years that are associated with you': 'Évitez les années qui vous sont associées',
    'Avoid dates and years that are associated with you': 'Évitez les dates et années qui vous sont associées'
  };

  return translations[message] || message;
}

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.passwordScore < 2) {
      this.errorMessage = 'Votre mot de passe est trop faible. Veuillez le renforcer avant de continuer.';
      return;
    }

    this.auth.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        this.auth.logout();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error ?? 'Erreur lors de la création du compte.';
      }
    });
  }
}