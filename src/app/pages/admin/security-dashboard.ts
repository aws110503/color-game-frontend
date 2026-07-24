import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-dashboard.html',
  styleUrls: ['./admin.css']
})
export class SecurityDashboard implements OnInit {
  loginFails24h = 0;
  suspiciousCount = 0;
  totalEvents = 0;
  suspiciousIps: any[] = [];
  auditLog: any[] = [];
  filteredLog: any[] = [];
  eventFilter = '';
  currentPage = 0;
  totalPages = 1;

  private apiUrl = 'http://localhost:8080/api/admin/security';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loadStats();
    this.loadSuspiciousIps();
    this.loadAuditLog();
  }

  loadStats() {
    this.http.get<any>(`${this.apiUrl}/stats`).subscribe({
      next: (data) => {
        this.loginFails24h = data.loginFailures24h || 0;
        this.totalEvents = (data.recentEvents || []).length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Stats error:', err)
    });
  }

  loadSuspiciousIps() {
    this.http.get<any[]>(`${this.apiUrl}/suspicious-ips`).subscribe({
      next: (data) => {
        this.suspiciousIps = data;
        this.suspiciousCount = data.length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Suspicious IPs error:', err)
    });
  }

  loadAuditLog() {
    this.http.get<any>(`${this.apiUrl}/audit-log?page=${this.currentPage}&size=20`).subscribe({
      next: (data) => {
        this.auditLog = data.content || [];
        this.filteredLog = [...this.auditLog];
        this.totalPages = data.totalPages || 1;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Audit log error:', err)
    });
  }

  filterLog() {
    if (!this.eventFilter) {
      this.filteredLog = [...this.auditLog];
    } else {
      this.filteredLog = this.auditLog.filter(e => e.eventType === this.eventFilter);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadAuditLog();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadAuditLog();
    }
  }

  exportCSV() {
    const headers = 'Event Type,User ID,IP Address,Endpoint,Details,Date\n';
    const rows = this.auditLog.map(e =>
      `"${e.eventType}","${e.userId || ''}","${e.ipAddress}","${e.endpoint}","${e.details || ''}","${e.occurredAt}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `security-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  getBadgeClass(type: string): string {
    if (type.includes('FAILURE') || type.includes('DENIED')) return 'badge-critical';
    if (type.includes('LOGIN')) return 'badge-login';
    if (type.includes('ACCESS')) return 'badge-access';
    return 'badge-medium';
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
