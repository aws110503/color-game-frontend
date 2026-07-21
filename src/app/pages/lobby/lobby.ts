import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth';
import { GameStateService } from '../../game-state';

interface NextRoundParams {
  difficulty: string;
  recommendedGridSize: string;
  averageRecentScore: number | null;
  roundsConsidered: number;
}

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.css']
})
export class Lobby implements OnInit {
  currentUser: string = '';
  isAdmin: boolean = false;

  nextParams: NextRoundParams = {
    difficulty: 'BEGINNER',
    recommendedGridSize: '3x3',
    averageRecentScore: null,
    roundsConsidered: 0
  };

  totalGames: number = 0;
  bestScore: number = 0;
  averageScore: number = 0;

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private gameState: GameStateService
  ) {}

  ngOnInit() {
    this.currentUser = localStorage.getItem('username') || 'Joueur';
    this.isAdmin = localStorage.getItem('role') === 'ADMIN';
    this.loadNextParams();
    this.loadStats();
  }

  loadNextParams() {
    this.http.get<NextRoundParams>(`${this.apiUrl}/game/next-params`).subscribe({
      next: (data) => {
        this.nextParams = data;
      },
      error: (err) => {
        console.error('Erreur chargement paramètres:', err);
        this.nextParams = {
          difficulty: 'BEGINNER',
          recommendedGridSize: '3x3',
          averageRecentScore: null,
          roundsConsidered: 0
        };
      }
    });
  }

  loadStats() {
    this.http.get<any>(`${this.apiUrl}/profile/me`).subscribe({
      next: (data) => {
        this.totalGames = data.totalGames || 0;
        this.averageScore = data.averageScore || 0;
      },
      error: (err) => console.error('Erreur chargement stats:', err)
    });

    this.http.get<any[]>(`${this.apiUrl}/game/history`).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const scores = data.map(r => r.playerScore || 0);
          this.bestScore = Math.max(...scores);
          if (this.totalGames === 0) {
            this.totalGames = data.length;
          }
          if (this.averageScore === 0) {
            this.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
          }
        }
      },
      error: (err) => console.error('Erreur chargement historique:', err)
    });
  }

  startGame() {
    const body = {
      gridSize: this.nextParams.recommendedGridSize  // '3x3', '4x4', ou '5x5'
    };

    this.http.post<any>(`${this.apiUrl}/game/start`, body).subscribe({
      next: (data) => {
        this.gameState.setActiveRound({
          roundId: data.roundId,
          targetGrid: JSON.parse(data.targetGrid),
          exposureTime: data.exposureTime,
          gridSize: data.gridSize
        });
        this.router.navigate(['/play']);
      },
      error: (err) => {
        console.error('Erreur démarrage partie:', err);
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}