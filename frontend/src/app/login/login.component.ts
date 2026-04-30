import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  registerData = { username: '', email: '', password: '' };
  isRegisterMode = false;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.credentials = { username: '', password: '' };
    this.registerData = { username: '', email: '', password: '' };
  }

  onSubmit() {
    if (this.isRegisterMode) {
      this.register();
    } else {
      this.login();
    }
  }

  login() {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Preencha usuário e senha.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Credenciais inválidas. Tente novamente.';
        alert('Erro ao fazer login. Verifique suas credenciais.');
        console.error('Login erro:', err);
      }
    });
  }

  register() {
    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Preencha todos os campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Usuário registrado com sucesso! Faça login.';
        this.isRegisterMode = false;
        alert('Usuário criado com sucesso!');
        this.credentials.username = this.registerData.username;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Erro ao registrar usuário.';
        alert(this.errorMessage);
        console.error('Register erro:', err);
      }
    });
  }
}
