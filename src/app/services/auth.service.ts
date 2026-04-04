import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface User {
  name: string;
  email: string;
  role: 'admin' | 'cliente';
  avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user: User | null = null;

  constructor(private supabaseService: SupabaseService) {
    // Restaura sessão de cliente local
    const saved = localStorage.getItem('attena_user');
    if (saved) {
      const parsed: User = JSON.parse(saved);
      // Sessão de admin vem do Supabase, não do localStorage
      if (parsed.role !== 'admin') {
        this._user = parsed;
      }
    }

    // Escuta mudanças de sessão do Supabase (admin)
    this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this._user = { name: session.user.email ?? 'Admin', email: session.user.email ?? '', role: 'admin' };
      } else if (this._user?.role === 'admin') {
        this._user = null;
      }
    });

    // Verifica sessão ativa do Supabase ao iniciar
    this.supabaseService.client.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        this._user = { name: data.session.user.email ?? 'Admin', email: data.session.user.email ?? '', role: 'admin' };
      }
    });
  }

  get isLogged(): boolean { return !!this._user; }
  get currentUser(): User | null { return this._user; }
  get isAdmin(): boolean { return this._user?.role === 'admin'; }
  public isAuthenticated(): boolean { return !!this._user; }

  public async loginAdmin(email: string, password: string): Promise<boolean> {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;
    this._user = { name: data.user.email ?? 'Admin', email: data.user.email ?? '', role: 'admin' };
    return true;
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
    if (users.find(u => u.email === email)) return false;
    users.push({ name, email, password });
    localStorage.setItem('attena_users', JSON.stringify(users));
    this._setUser({ name, email, role: 'cliente' });
    return true;
  }

  public loginGoogle(): void {
    this._setUser({ name: 'Usuário Google', email: 'google@gmail.com', role: 'cliente', avatar: 'G' });
  }

  public async logout(): Promise<void> {
    if (this._user?.role === 'admin') {
      await this.supabaseService.client.auth.signOut();
    }
    localStorage.removeItem('attena_user');
    this._user = null;
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
