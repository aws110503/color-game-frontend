import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface GameHistory {
  id: number;
  playerScore: number;
  gridSize: string;
  exposureTime: number;
  playedAt: string;
  verdict: string;
  dominantMistake: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class History implements OnInit {
  history: GameHistory[] = [];
  filteredHistory: GameHistory[] = [];
  filterText = '';
  sortBy = 'date-desc';

  totalGames = 0;
  bestScore = 0;
  averageScore = 0;
  errorMessage = '';

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.http.get<GameHistory[]>(`${this.apiUrl}/game/history`).subscribe({
      next: (data) => {
        this.history = data;
        this.filteredHistory = [...data];
        this.calculateStats();
      },
      error: (err) => {
        console.error('Erreur chargement historique:', err);
        this.errorMessage = "Impossible de charger l'historique.";
      }
    });
  }

  calculateStats() {
    this.totalGames = this.history.length;
    if (this.history.length === 0) {
      this.bestScore = 0;
      this.averageScore = 0;
      return;
    }
    const scores = this.history.map(h => h.playerScore || 0);
    this.bestScore = Math.max(...scores);
    this.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
  }

  applyFilter() {
    let result = [...this.history];

    if (this.filterText) {
      const term = this.filterText.toLowerCase();
      result = result.filter(h => 
        (h.verdict?.toLowerCase().includes(term)) ||
        (h.dominantMistake?.toLowerCase().includes(term)) ||
        (h.gridSize?.toLowerCase().includes(term)) ||
        (h.playerScore?.toString().includes(term))
      );
    }

    switch (this.sortBy) {
      case 'date-desc':
        result.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime());
        break;
      case 'score-desc':
        result.sort((a, b) => b.playerScore - a.playerScore);
        break;
      case 'score-asc':
        result.sort((a, b) => a.playerScore - b.playerScore);
        break;
    }

    this.filteredHistory = result;
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }

  viewDetails(roundId: number) {
    console.log('View details for round:', roundId);
  }
}