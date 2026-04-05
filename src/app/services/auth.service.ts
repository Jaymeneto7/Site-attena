import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cliente';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _userSubject = new BehaviorSubject<User | null>(null);

  /** Observable para outros serviços reagirem a mudanças de sessão */
  readonly user$ = this._userSubject.asObservable();

  private get _user(): User | null { return this._userSubject.getValue(); }
  private set _user(value: User | null) { this._userSubject.next(value); }

  constructor(private supabaseService: SupabaseService, private ngZone: NgZone) {
    // Única fonte de verdade para sessão — evita lock conflicts no Supabase
    this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
      this.ngZone.run(() => {
        this._user = session?.user ? this._mapUser(session.user) : null;
      });
    });

    this.supabaseService.client.auth.getSession().then(({ data }) => {
      this.ngZone.run(() => {
        if (data.session?.user) {
          this._user = this._mapUser(data.session.user);
        }
      });
    });
  }

  get isLogged(): boolean { return !!this._user; }
  get currentUser(): User | null { return this._user; }
  get isAdmin(): boolean { return this._user?.role === 'admin'; }
  isAuthenticated(): boolean { return !!this._user; }

  async login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: 'E-mail ou senha incorretos.' };
    if (data.user) this.ngZone.run(() => { this._user = this._mapUser(data.user!); });
    return { ok: true };
  }

  async registerCliente(name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const { data, error } = await this.supabaseService.client.auth.signUp({
      email,
      password,
      options: { data: { role: 'cliente', name } }
    });
    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return { ok: false, error: 'Este e-mail já está cadastrado.' };
      }
      return { ok: false, error: error.message };
    }
    if (data.user) this.ngZone.run(() => { this._user = this._mapUser(data.user!); });
    return { ok: true };
  }

  async updateProfile(name: string, email: string, password?: string): Promise<{ ok: boolean; error?: string }> {
    if (!this._user) return { ok: false, error: 'Não autenticado.' };

    const updates: { data: { name: string }; email?: string; password?: string } = { data: { name } };
    if (email !== this._user.email) updates.email = email;
    if (password) updates.password = password;

    const { data, error } = await this.supabaseService.client.auth.updateUser(updates);
    if (error) return { ok: false, error: error.message };
    if (data.user) {
      this.ngZone.run(() => {
        this._user = this._mapUser(data.user!);
        if (updates.email) this._user = { ...this._user!, email: updates.email };
      });
    }
    return { ok: true };
  }

  async loginWithGoogle(): Promise<void> {
    await this.supabaseService.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  }

  async logout(): Promise<void> {
    await this.supabaseService.client.auth.signOut();
    this.ngZone.run(() => { this._user = null; });
  }

  async loginAdmin(email: string, password: string): Promise<boolean> {
    const result = await this.login(email, password);
    return result.ok && this.isAdmin;
  }

  private _mapUser(u: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User {
    const meta = u.user_metadata ?? {};
    const role: 'admin' | 'cliente' = meta['role'] === 'cliente' ? 'cliente' : 'admin';
    const name = (meta['name'] as string) || (meta['full_name'] as string) || u.email || 'Usuário';
    return { id: u.id, name, email: u.email ?? '', role };
  }
}
