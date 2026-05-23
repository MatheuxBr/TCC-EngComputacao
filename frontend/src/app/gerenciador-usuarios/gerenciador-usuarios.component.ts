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

  constructor(private userService: UserService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.isLoading = true;
    this.userService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.showError('Erro ao carregar usuários');
        this.isLoading = false;
      }
    });
  }

  promoverUsuario(id: number): void {
    if (confirm('Tem certeza que deseja promover este usuário a Administrador?')) {
      this.userService.promoverParaAdmin(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Usuário promovido com sucesso!');
          this.carregarUsuarios();
        },
        error: () => {
          this.toastService.showError('Erro ao promover usuário');
        }
      });
    }
  }
}
