import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../auth';
import { DatePipe } from '@angular/common';

interface HistoryEntry {
  id: number;
  username: string;
  rowIndex: number;
  colIndex: number;
  color: string;
  changedAt: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History implements OnInit {
  entries: HistoryEntry[] = [];
  filterDate = '';

  private apiUrl = 'http://localhost:8080/api/history/me';

  constructor(private http: HttpClient, public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.http.get<HistoryEntry[]>(this.apiUrl).subscribe({
      next: (data) => this.entries = data,
      error: (err) => console.error('Erreur chargement historique:', err)
    });
  }

  get filteredEntries(): HistoryEntry[] {
    if (!this.filterDate) return this.entries;
    return this.entries.filter(e => e.changedAt.startsWith(this.filterDate));
  }

  logout() {
    const confirmed = confirm('Voulez-vous vraiment vous déconnecter ?');
    if (confirmed) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }
}