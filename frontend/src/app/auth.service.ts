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
        }
      })
    );
  }

  register(userData: any) {
    return this.http.post<any>('/api/auth/register', userData);
  }

  logout() {
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('username');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }
}
