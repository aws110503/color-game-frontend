import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

interface CoachingResponse {
  message: string;
  focusArea: string;
}

interface CoachingHistoryEntry {
  headline: string;
  message: string;
  focusArea: string;
  createdAt: string;
}

@Component({
  selector: 'app-coach-panel',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './coach-panel.html',
  styleUrl: './coach-panel.css'
})
export class CoachPanel implements OnInit {
  latestMessage = signal<CoachingResponse | null>(null);
  history = signal<CoachingHistoryEntry[]>([]);
  loadingLatest = signal(true);
  errorMessage = signal('');
  showHistory = signal(false);

  private apiUrl = 'http://localhost:8080/api/profile';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Generates a NEW coaching message every time this panel loads — spends Gemini
    // quota on each profile page visit. Once it resolves, refresh history so the
    // fresh message appears in the list without a second round trip logic branch.
    this.generateCoaching();
  }

  generateCoaching() {
    this.loadingLatest.set(true);
    this.errorMessage.set('');

    this.http.post<CoachingResponse>(`${this.apiUrl}/coaching`, {}).subscribe({
      next: (res) => {
        this.latestMessage.set(res);
        this.loadingLatest.set(false);
        this.loadHistory();
      },
      error: (err) => {
        this.loadingLatest.set(false);
        this.errorMessage.set(err.error ?? 'Impossible de générer un message de coaching.');
      }
    });
  }

  loadHistory() {
    this.http.get<CoachingHistoryEntry[]>(`${this.apiUrl}/coaching/history`).subscribe({
      next: (data) => this.history.set(data),
      error: (err) => console.error('Erreur chargement historique de coaching:', err)
    });
  }

  toggleHistory() {
    this.showHistory.update(v => !v);
  }
}