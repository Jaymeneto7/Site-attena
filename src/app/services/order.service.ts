import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CartItem } from './cart.service';

export type OrderStatus = 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado';

export interface Order {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendente:  'Aguardando pagamento',
  pago:      'Pago',
  enviado:   'Enviado',
  entregue:  'Entregue',
  cancelado: 'Cancelado',
};

export const ORDER_STATUS_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pendente: 'pago',
  pago:     'enviado',
  enviado:  'entregue',
};

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private supabase: SupabaseService) {}

  async saveOrder(items: CartItem[], total: number, guestName?: string): Promise<void> {
    const { data: { session } } = await this.supabase.client.auth.getSession();

    const userId   = session?.user?.id   ?? null;
    const userEmail = session?.user?.email ?? null;
    const meta = session?.user?.user_metadata ?? {};
    const userName = (meta['name'] as string)
      || (meta['full_name'] as string)
      || guestName
      || userEmail
      || 'Cliente';

    const { error } = await this.supabase.client.from('orders').insert({
      user_id:    userId,
      user_email: userEmail,
      user_name:  userName,
      items,
      total,
      status: 'pendente',
    });
    if (error) throw error;
  }

  async getMyOrders(): Promise<Order[]> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Order[];
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('getAllOrders error:', error); return []; }
    return (data ?? []) as Order[];
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    await this.supabase.client
      .from('orders')
      .update({ status })
      .eq('id', orderId);
  }
}
