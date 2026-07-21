import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface PlayerProfile {
  totalGames: number;
  averageScore: number;
  currentDifficulty: string;
  knownWeaknesses: string[];
  knownStrengths: string[];
}

interface CoachingMessage {
  id: number;
  headline: string;
  content: string;
  focusArea: string;
  createdAt: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileDashboard implements OnInit {
  currentUser: string = '';
  isAdmin: boolean = false;

  profile: PlayerProfile = {
    totalGames: 0,
    averageScore: 0,
    currentDifficulty: 'BEGINNER',
    knownWeaknesses: [],
    knownStrengths: []
  };

  bestScore = 0;
  latestCoaching: CoachingMessage | null = null;
  coachingHistory: CoachingMessage[] = [];
  generatingCoaching = false;

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = localStorage.getItem('username') || 'Joueur';
    this.isAdmin = localStorage.getItem('role') === 'ADMIN';
    this.loadProfile();
    this.loadCoachingHistory();
    this.loadBestScore();
  }

  loadProfile() {
    this.http.get<PlayerProfile>(`${this.apiUrl}/profile/me`).subscribe({
      next: (data) => {
        this.profile = {
          ...data,
          knownWeaknesses: data.knownWeaknesses || [],
          knownStrengths: data.knownStrengths || []
        };
      },
      error: (err) => {
        console.error('Erreur chargement profil:', err);
      }
    });
  }

  loadBestScore() {
    this.http.get<any[]>(`${this.apiUrl}/game/history`).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const scores = data.map(r => r.playerScore || 0);
          this.bestScore = Math.max(...scores);
        }
      },
      error: (err) => console.error('Erreur chargement meilleur score:', err)
    });
  }

  loadCoachingHistory() {
    this.http.get<CoachingMessage[]>(`${this.apiUrl}/profile/coaching/history`).subscribe({
      next: (data) => {
        this.coachingHistory = data || [];
        if (this.coachingHistory.length > 0) {
          this.latestCoaching = this.coachingHistory[0];
        }
      },
      error: (err) => {
        console.error('Erreur chargement coaching:', err);
      }
    });
  }

  generateCoaching() {
    this.generatingCoaching = true;
    this.http.post<CoachingMessage>(`${this.apiUrl}/profile/coaching`, {}).subscribe({
      next: (data) => {
        this.latestCoaching = data;
        this.coachingHistory.unshift(data);
        this.generatingCoaching = false;
      },
      error: (err) => {
        console.error('Erreur generation coaching:', err);
        this.generatingCoaching = false;
      }
    });
  }
}