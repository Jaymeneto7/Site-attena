import { Injectable } from '@angular/core';

export interface User {
  name: string;
  email: string;
  role: 'admin' | 'cliente';
  avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user: User | null = null;

  constructor() {
    const saved = localStorage.getItem('attena_user');
    if (saved) this._user = JSON.parse(saved);
  }

  get isLogged(): boolean { return !!this._user; }
  get currentUser(): User | null { return this._user; }
  get isAdmin(): boolean { return this._user?.role === 'admin'; }

  public isAuthenticated(): boolean { return !!this._user; }

  public loginAdmin(email: string, password: string): boolean {
    if (email === 'admin@attena.com' && password === 'attena2024') {
      this._setUser({ name: 'Administrador', email, role: 'admin' });
      return true;
    }
    return false;
  }

  public loginCliente(email: string, password: string): boolean {
    const users = this._getRegisteredUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      this._setUser({ name: user.name, email: user.email, role: 'cliente' });
      return true;
    }
    return false;
  }

  public registerCliente(name: string, email: string, password: string): boolean {
    const users = this._getRegisteredUsers();
    if (users.find(u => u.email === email)) return false; // já existe
    users.push({ name, email, password });
    localStorage.setItem('attena_users', JSON.stringify(users));
    this._setUser({ name, email, role: 'cliente' });
    return true;
  }

  public loginGoogle(): void {
    // Simulado — futuramente integrar Firebase Google Auth
    this._setUser({
      name: 'Usuário Google',
      email: 'google@gmail.com',
      role: 'cliente',
      avatar: 'G'
    });
  }

  public logout(): void {
    localStorage.removeItem('attena_user');
    this._user = null;
  }

  // Compatibilidade com código antigo
  public login(token: string = 'dummy_token'): void {
    this._setUser({ name: 'Administrador', email: 'admin@attena.com', role: 'admin' });
  }

  private _setUser(user: User): void {
    this._user = user;
    localStorage.setItem('attena_user', JSON.stringify(user));
  }

  private _getRegisteredUsers(): { name: string; email: string; password: string }[] {
    const raw = localStorage.getItem('attena_users');
    return raw ? JSON.parse(raw) : [];
  }
}