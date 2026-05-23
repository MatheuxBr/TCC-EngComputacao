import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth/login';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any) {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap(response => {
        if (response && response.success) {
          localStorage.setItem('username', response.username);
          if (response.id) {
            localStorage.setItem('user_id', response.id.toString());
          }
          if (response.id_nivel) {
            localStorage.setItem('id_nivel', response.id_nivel.toString());
          }
        }
      })
    );
  }

  register(userData: any) {
    return this.http.post<any>('/api/auth/register', userData);
  }

  logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('id_nivel');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('username');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  }

  isAdmin(): boolean {
    const nivel = localStorage.getItem('id_nivel');
    return nivel === '1'; // 1 representa Admin
  }
}
