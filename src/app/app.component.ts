import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { CartService, CartItem } from './services/cart.service';
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

  constructor(public cartService: CartService, public router: Router) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  closeCart(): void { this.showCart = false; }

  removeItem(id: number, size?: string): void {
    this.cartService.removeItem(id, size);
  }

  sendWhatsApp(): void {
    const items = this.cartService.getItems();
    if (!items.length) return;
    const WHATSAPP_NUMBER = '5562982437603';
    const lines = items.map(i =>
      `• ${i.name} (x${i.quantity ?? 1}) — R$ ${i.price.toFixed(2).replace('.', ',')}`
    ).join('\n');
    const total = this.cartService.getTotalPrice().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const msg = `*Novo Pedido:*\n\n${lines}\n\n*Total: ${total}*`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }
}