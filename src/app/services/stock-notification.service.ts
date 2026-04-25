import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class StockNotificationService {
  private subscribed = new Set<string>();

  constructor(private supabase: SupabaseService) {}

  async loadSubscriptions(userId: string): Promise<void> {
    const { data } = await this.supabase.client
      .from('stock_notifications')
      .select('product_id')
      .eq('user_id', userId);
    this.subscribed = new Set((data ?? []).map((r: { product_id: string }) => r.product_id));
  }

  isSubscribed(productId: string | number): boolean {
    return this.subscribed.has(String(productId));
  }

  async subscribe(productId: string | number, userId: string, email: string): Promise<void> {
    await this.supabase.client
      .from('stock_notifications')
      .upsert(
        { user_id: userId, product_id: String(productId), email },
        { onConflict: 'user_id,product_id' }
      );
    this.subscribed.add(String(productId));
  }

  async notifySubscribers(productId: string | number): Promise<void> {
    try {
      await this.supabase.client.functions.invoke('notify-stock', {
        body: { product_id: String(productId) }
      });
    } catch {
      // Edge Function opcional — não bloqueia o fluxo
    }
  }
}
