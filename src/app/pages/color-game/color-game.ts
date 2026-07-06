import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-color-game',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './color-game.html',
  styleUrl: './color-game.css'
})
export class ColorGame {
  columns = 4;
  rows = 4;
  grid: string[][] = [];

  showPopup = false;
  selectedRow = 0;
  selectedCol = 0;
  tempColor = '#ffffff';

  private apiUrl = 'http://localhost:8080/api/history';

  constructor(private http: HttpClient, public auth: AuthService, private router: Router) {
    this.generateGrid();
  }

  generateGrid() {
    this.grid = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => '#ffffff')
    );
  }

  openPopup(row: number, col: number) {
    this.selectedRow = row;
    this.selectedCol = col;
    this.tempColor = this.grid[row][col];
    this.showPopup = true;
  }

  confirmColor() {
    this.grid[this.selectedRow][this.selectedCol] = this.tempColor;
    this.showPopup = false;

    this.http.post(this.apiUrl, {
      rowIndex: this.selectedRow,
      colIndex: this.selectedCol,
      color: this.tempColor
    }).subscribe({
      error: (err) => console.error('Erreur enregistrement historique:', err)
    });
  }

  cancelColor() {
    this.showPopup = false;
  }

  logout() {
    const confirmed = confirm('Voulez-vous vraiment vous déconnecter ?');
    if (confirmed) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }
}