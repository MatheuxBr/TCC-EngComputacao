import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UsuarioDTO } from '../user.service';
import { ToastService } from '../toast.service';

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

  constructor(private userService: UserService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => {
        this.errorMessage = 'Falha ao carregar os usuários. Tente novamente mais tarde.';
        this.toastService.show('Erro ao carregar usuários', 'error');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
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
        }
      });
    }
  }
}
