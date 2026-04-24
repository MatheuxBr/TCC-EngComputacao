import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Se já estiver logado, não tem porquê ver a tela de login
    router.navigate(['/dashboard'], { replaceUrl: true });
    return false;
  }

  return true;
};
