import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CartItem } from './cart.service';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private supabase: SupabaseService) {}

  async saveOrder(items: CartItem[], total: number): Promise<void> {
    const { data: { session } } = await this.supabase.client.auth.getSession();
    if (!session?.user) return;

    await this.supabase.client.from('orders').insert({
      user_id: session.user.id,
      items,
      total,
    });
  }

  async getMyOrders(): Promise<Order[]> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Order[];
  }
}
