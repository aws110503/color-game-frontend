import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth';
import { DecimalPipe } from '@angular/common';

interface HistoryEntry {
  color: string;
}

@Component({
  selector: 'app-color-game',
  standalone: true,
  imports: [FormsModule, RouterLink,  DecimalPipe],
  templateUrl: './color-game.html',
  styleUrl: './color-game.css'
})
export class ColorGame implements OnInit {
  columns = 4;
  rows = 4;
  grid: string[][] = [];

  showPopup = false;
  selectedRow = 0;
  selectedCol = 0;
  tempColor = '#ffffff';

  private apiUrl = 'http://localhost:8080/api/history';

  // --- Prediction feature ---
  colorFrequency: Record<string, number> = {};
  predictedColor: string | null = null;
  predictionResult: 'correct' | 'wrong' | null = null;
  correctPredictions = 0;
  totalPredictions = 0;

  constructor(private http: HttpClient, public auth: AuthService, private router: Router) {
    this.generateGrid();
  }

  ngOnInit() {
    this.loadHistoryForPrediction();
  }

  loadHistoryForPrediction() {
    this.http.get<HistoryEntry[]>(`${this.apiUrl}/me`).subscribe({
      next: (entries) => {
        for (const entry of entries) {
          const normalized = entry.color.toLowerCase().trim();
          this.colorFrequency[normalized] = (this.colorFrequency[normalized] || 0) + 1;
        }
      },
      error: (err) => console.error('Erreur chargement historique pour prédiction:', err)
    });
  }

  generateGrid() {
    this.grid = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => '#ffffff')
    );
  }

  private predictNextColor(): string | null {
    const colors = Object.keys(this.colorFrequency);
    if (colors.length === 0) return null;

    // Weighted random pick based on frequency
    const totalWeight = colors.reduce((sum, c) => sum + this.colorFrequency[c], 0);
    let rand = Math.random() * totalWeight;

    for (const color of colors) {
      rand -= this.colorFrequency[color];
      if (rand <= 0) return color;
    }
    return colors[0];
  }

  openPopup(row: number, col: number) {
    this.selectedRow = row;
    this.selectedCol = col;
    this.tempColor = this.grid[row][col];
    this.predictedColor = this.predictNextColor();
    this.predictionResult = null;
    this.showPopup = true;
  }

  confirmColor() {
    this.grid[this.selectedRow][this.selectedCol] = this.tempColor;

    // Check prediction accuracy
    if (this.predictedColor) {
      const actual = this.tempColor.toLowerCase().trim();
      this.totalPredictions++;
      if (actual === this.predictedColor) {
        this.correctPredictions++;
        this.predictionResult = 'correct';
      } else {
        this.predictionResult = 'wrong';
      }
    }

    // Update frequency map live for smarter future predictions
    const normalized = this.tempColor.toLowerCase().trim();
    this.colorFrequency[normalized] = (this.colorFrequency[normalized] || 0) + 1;

    this.http.post(this.apiUrl, {
      rowIndex: this.selectedRow,
      colIndex: this.selectedCol,
      color: this.tempColor
    }).subscribe({
      error: (err) => console.error('Erreur enregistrement historique:', err)
    });

    // Keep popup open briefly to show the result, then close
    setTimeout(() => {
      this.showPopup = false;
      this.predictionResult = null;
    }, 1800);
  }

  cancelColor() {
    this.showPopup = false;
    this.predictionResult = null;
  }

  logout() {
    const confirmed = confirm('Voulez-vous vraiment vous déconnecter ?');
    if (confirmed) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }
}