import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-dashboard.html',
  styleUrls: ['./admin.css']
})
export class SecurityDashboard implements OnInit {
  stats: any = null;
  suspiciousIps: any[] = [];
  auditLog: any[] = [];
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  selectedEventType = 'All Events';

  private apiUrl = 'http://localhost:8080/api/admin/security';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.http.get(`${this.apiUrl}/stats`).subscribe({
      next: (data: any) => {
        this.stats = data;
      },
      error: (err) => console.error('Stats error:', err)
    });

    this.http.get(`${this.apiUrl}/suspicious-ips`).subscribe({
      next: (data: any) => {
        this.suspiciousIps = data;
      },
      error: (err) => console.error('Suspicious IPs error:', err)
    });

    this.loadAuditLog();
  }

  loadAuditLog(): void {
    const url = `${this.apiUrl}/audit-log?page=${this.currentPage}&size=${this.pageSize}`;
    this.http.get(url).subscribe({
      next: (data: any) => {
        this.auditLog = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
      },
      error: (err) => console.error('Audit log error:', err)
    });
  }

  onFilterChange(eventType: string): void {
    this.selectedEventType = eventType;
    this.currentPage = 0;
    this.loadAuditLog();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadAuditLog();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadAuditLog();
    }
  }

  refresh(): void {
    this.loadAll();
  }

  exportCsv(): void {
    const headers = ['Event', 'User ID', 'IP Address', 'Endpoint', 'Details', 'Date'];
    const rows = this.auditLog.map(e => [
      e.eventType, e.userId, e.ipAddress, e.endpoint, e.details, e.occurredAt
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
  }
}