import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard como uma função CanActivateFn, o padrão Standalone preferido.
 * Esta função é responsável por proteger a rota 'admin'.
 */
export const AuthGuard: CanActivateFn = (route, state) => {
  // Usa 'inject' para obter as dependências dentro do contexto da função guard
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Verifica o status de login (assumindo que 'isLogged' é um booleano ou getter no AuthService)
  if (authService.isLogged) { 
    return true; // Acesso permitido
  }

  // Se não estiver logado:
  // 1. Redireciona para a página inicial (catálogo)
  // 2. Retorna 'false' para bloquear o acesso à rota 'admin'
  router.navigate(['/']); 
  return false;
};