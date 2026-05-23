import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UsuarioDTO } from '../user.service';
import { ToastService } from '../toast.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-gerenciador-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gerenciador-usuarios.component.html',
  styleUrl: './gerenciador-usuarios.component.css'
})
export class GerenciadorUsuariosComponent implements OnInit {
  usuarios: UsuarioDTO[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private userService: UserService, 
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Falha ao carregar os usuários. Tente novamente mais tarde.';
        this.toastService.show('Erro ao carregar usuários', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  promoverUsuario(id: number): void {
    if (confirm('Tem certeza que deseja promover este usuário a Administrador?')) {
      this.userService.promoverParaAdmin(id).subscribe({
        next: () => {
          this.toastService.show('Usuário promovido com sucesso!', 'success');
          this.carregarUsuarios();
        },
        error: () => {
          this.toastService.show('Erro ao promover usuário', 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  excluirUsuario(id: number): void {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      this.userService.excluirUsuario(id).subscribe({
        next: () => {
          this.toastService.show('Usuário excluído com sucesso!', 'success');
          this.carregarUsuarios();
        },
        error: (err) => {
          const msg = err.error?.error || 'Erro ao excluir usuário';
          this.toastService.show(msg, 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }
}
