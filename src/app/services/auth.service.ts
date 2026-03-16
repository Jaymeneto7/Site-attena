// File: src/app/services/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * Estado interno de autenticação.
   * Mantido privado e exposto apenas via getter.
   */
  private _isAuthenticated = false;

  constructor() {
    // Mantém o usuário logado caso exista token gravado
    this._isAuthenticated = this.hasToken();
  }

  /** Getter público para verificar login — recomendado Angular style */
  get isLogged(): boolean {
    return this._isAuthenticated;
  }

  /** Método padrão usado por componentes */
  public isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  /** Login simples (mock) — opcionalmente recebe token */
  public login(token: string = 'dummy_token'): void {
    localStorage.setItem('auth_token', token);
    this._isAuthenticated = true;
  }

  /** Logout global */
  public logout(): void {
    localStorage.removeItem('auth_token');
    this._isAuthenticated = false;
  }

  /** Verifica se existe token salvo */
  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}
