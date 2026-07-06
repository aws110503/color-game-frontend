import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

interface LoginRequest {
  identifier: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  username = signal<string | null>(localStorage.getItem('username'));
  role = signal<string | null>(localStorage.getItem('role'));

  constructor(private http: HttpClient) {}

  login(identifier: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { identifier, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).pipe(
      tap(response => this.storeSession(response))
    );
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    const body: RegisterRequest = { username, email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, body).pipe(
      tap(response => this.storeSession(response))
    );
  }

  private storeSession(response: AuthResponse) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('username', response.username);
    localStorage.setItem('role', response.role);
    this.username.set(response.username);
    this.role.set(response.role);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    this.username.set(null);
    this.role.set(null);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  isAdmin(): boolean {
    return this.role() === 'ADMIN';
  }
}