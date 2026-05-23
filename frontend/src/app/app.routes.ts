import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GerenciadorUsuariosComponent } from './gerenciador-usuarios/gerenciador-usuarios.component';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'admin/usuarios', component: GerenciadorUsuariosComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
