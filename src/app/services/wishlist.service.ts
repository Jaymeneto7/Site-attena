import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private _ids = new Set<string>();
  private _ids$ = new BehaviorSubject<Set<string>>(new Set<string>());

  constructor(private supabase: SupabaseService, private authService: AuthService) {
    // Reage às mudanças de sessão via AuthService — sem chamar Supabase Auth diretamente
    this.authService.user$.subscribe(user => {
      if (user) {
        this._loadAndMerge(user.id);
      } else {
        this._loadFromLocalStorage();
      }
    });
  }

  get ids$() { return this._ids$.asObservable(); }
  has(id: string | number): boolean { return this._ids.has(String(id)); }
  getAll(): string[] { return [...this._ids]; }
  count(): number { return this._ids.size; }

  async toggle(id: string | number): Promise<void> {
    const key = String(id);
    const isAdding = !this._ids.has(key);

    // Atualização otimista — UI responde imediatamente
    if (isAdding) this._ids.add(key); else this._ids.delete(key);
    this._ids$.next(new Set(this._ids));

    const userId = this.authService.currentUser?.id;
    if (userId) {
      if (isAdding) {
        await this.supabase.client.from('wishlists')
          .insert({ user_id: userId, product_id: key });
      } else {
        await this.supabase.client.from('wishlists')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', key);
      }
    } else {
      this._saveToLocalStorage();
    }
  }

  private async _loadAndMerge(userId: string): Promise<void> {
    const guestIds = this._getLocalIds();

    const { data } = await this.supabase.client
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId);

    const serverIds = new Set((data ?? []).map((r: { product_id: string }) => r.product_id));

    const toMerge = guestIds.filter(id => !serverIds.has(id));
    if (toMerge.length > 0) {
      await this.supabase.client.from('wishlists').insert(
        toMerge.map(product_id => ({ user_id: userId, product_id }))
      );
      toMerge.forEach(id => serverIds.add(id));
      localStorage.removeItem('attena_wishlist');
    }

    this._ids = serverIds;
    this._ids$.next(new Set(this._ids));
  }

  private _loadFromLocalStorage(): void {
    this._ids = new Set(this._getLocalIds());
    this._ids$.next(new Set(this._ids));
  }

  private _getLocalIds(): string[] {
    try { return JSON.parse(localStorage.getItem('attena_wishlist') ?? '[]'); }
    catch { return []; }
  }

  private _saveToLocalStorage(): void {
    localStorage.setItem('attena_wishlist', JSON.stringify([...this._ids]));
  }
}
