import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { CartService, CartItem } from './services/cart.service';
import { OrderService } from './services/order.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Attena';
  showCart = false;
  cartItems: CartItem[] = [];
  private cartSubscription?: Subscription;

  constructor(public cartService: CartService, public router: Router, private orderService: OrderService) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItems = items;
    });
    this.cartService.openCart$.subscribe(() => { this.showCart = true; });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  closeCart(): void { this.showCart = false; }

  clearCart(): void { this.cartService.clearCart(); }

  removeItem(id: string | number, size?: string, color?: string): void {
    this.cartService.removeItem(id, size, color);
  }

  sendWhatsApp(): void {
    const items = this.cartService.getItems();
    if (!items.length) return;
    const WHATSAPP_NUMBER = '5562982437603';
    const lines = items.map(i => {
      const details = [i.size, i.color].filter(Boolean).join(', ');
      const detailsInfo = details ? ` (${details})` : '';
      return `• ${i.name}${detailsInfo} x${i.quantity ?? 1} — R$ ${i.price.toFixed(2).replace('.', ',')}`;
    }).join('\n');
    const total = this.cartService.getTotalPrice();
    const totalStr = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const msg = `*Novo Pedido:*\n\n${lines}\n\n*Total: ${totalStr}*`;
    this.orderService.saveOrder(items, total).catch(console.error);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }
}