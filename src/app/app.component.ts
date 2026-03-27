import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'Attena';
  showCart = false;

  constructor(public cartService: CartService) {}

  closeCart(): void { this.showCart = false; }

 sendWhatsApp(): void {
  const items = this.cartService.cartItems;
  if (!items.length) return;
  const WHATSAPP_NUMBER = '5562982437603';
  const lines = items.map(i =>
    `• ${i.name} (x${i.qty}) — R$ ${i.price.toFixed(2).replace('.', ',')}`
  ).join('\n');
  const total = this.cartService.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const msg = `*Novo Pedido:*\n\n${lines}\n\n*Total: ${total}*`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }
  }