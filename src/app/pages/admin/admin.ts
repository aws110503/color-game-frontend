import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {
  activeTab: 'users' | 'history' = 'users';
  currentUser: string = '';
  
  // Users
  users: any[] = [];
  adminCount = 0;
  userCount = 0;
  
  // History
  history: any[] = [];
  filteredHistory: any[] = [];
  historyFilter = '';
  averageScore = 0;
  bestScore = 0;

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ← AJOUTE ÇA
  ) {}

  ngOnInit() {
    this.currentUser = localStorage.getItem('username') || 'admin';
    this.loadUsers();
    this.loadHistory();
  }

  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/users`).subscribe({
      next: (data) => {
        this.users = data;
        this.adminCount = data.filter(u => u.role === 'ADMIN').length;
        this.userCount = data.filter(u => u.role === 'USER').length;
        
        // Force Angular à rafraîchir le template
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement utilisateurs:', err)
    });
  }

  loadHistory() {
    this.http.get<any[]>(`${this.apiUrl}/history/all`).subscribe({
      next: (data) => {
        this.history = data;
        this.filteredHistory = data;
        this.calculateStats();
        
        // Force Angular à rafraîchir le template
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement historique:', err)
    });
  }

  filterHistory() {
    const term = this.historyFilter.toLowerCase();
    this.filteredHistory = this.history.filter(h => 
      h.username?.toLowerCase().includes(term)
    );
    this.calculateStats();
  }

  calculateStats() {
    if (this.filteredHistory.length === 0) {
      this.averageScore = 0;
      this.bestScore = 0;
      return;
    }
    const scores = this.filteredHistory.map(h => h.playerScore || 0);
    this.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    this.bestScore = Math.max(...scores);
  }

  deleteUser(id: number) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.http.delete(`${this.apiUrl}/users/${id}`).subscribe({
      next: () => {
        this.loadUsers();
        this.cdr.detectChanges();  // ← Force le rafraîchissement après suppression
      },
      error: (err) => console.error(err)
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}