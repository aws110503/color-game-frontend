import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth';

interface UserEntry {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface HistoryEntry {
  id: number;
  username: string;
  rowIndex: number;
  colIndex: number;
  color: string;
  changedAt: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  activeTab: 'users' | 'history' = 'users';

  users: UserEntry[] = [];
  history: HistoryEntry[] = [];
  filterUsername = '';

  constructor(private http: HttpClient, public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
    this.loadHistory();
  }

  loadUsers() {
    this.http.get<UserEntry[]>('http://localhost:8080/api/admin/users').subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Erreur chargement utilisateurs:', err)
    });
  }

  loadHistory() {
    this.http.get<HistoryEntry[]>('http://localhost:8080/api/admin/history/all').subscribe({
      next: (data) => this.history = data,
      error: (err) => console.error('Erreur chargement historique global:', err)
    });
  }

  get filteredHistory(): HistoryEntry[] {
    if (!this.filterUsername) return this.history;
    return this.history.filter(h =>
      h.username.toLowerCase().includes(this.filterUsername.toLowerCase())
    );
  }

  logout() {
    const confirmed = confirm('Voulez-vous vraiment vous déconnecter ?');
    if (confirmed) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }
}