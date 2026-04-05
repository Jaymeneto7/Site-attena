import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';

interface Product {
  id: number;
  emoji: string;
  name: string;
  category: string;
  price: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  showCart = false; // ← linha adicionada

  readonly WHATSAPP_NUMBER = '5511999999999';

  readonly PRODUCTS: Product[] = [
    { id: 1,  emoji: '👟', name: 'Tênis Urban Runner',         category: 'Calçados',    price: 299.90 },
    { id: 2,  emoji: '👕', name: 'Camiseta Oversized Premium', category: 'Vestuário',   price: 89.90  },
    { id: 3,  emoji: '🎧', name: 'Fone Bluetooth Pro',         category: 'Eletrônicos', price: 349.90 },
    { id: 4,  emoji: '🎒', name: 'Mochila Slim Carry',         category: 'Acessórios',  price: 189.90 },
    { id: 5,  emoji: '⌚', name: 'Relógio Smart Watch X3',      category: 'Eletrônicos', price: 599.90 },
    { id: 6,  emoji: '🕶️', name: 'Óculos de Sol Retrô',        category: 'Acessórios',  price: 149.90 },
    { id: 7,  emoji: '👖', name: 'Calça Jogger Slim',           category: 'Vestuário',   price: 129.90 },
    { id: 8,  emoji: '💻', name: 'Suporte para Notebook',       category: 'Eletrônicos', price: 79.90  },
    { id: 9,  emoji: '🧴', name: 'Kit Skincare Completo',       category: 'Beleza',      price: 239.90 },
    { id: 10, emoji: '📱', name: 'Capa Magnética iPhone',       category: 'Eletrônicos', price: 59.90  },
    { id: 11, emoji: '🏋️', name: 'Corda de Pular Speed',       category: 'Esportes',    price: 44.90  },
    { id: 12, emoji: '☕', name: 'Garrafa Térmica 1L',          category: 'Acessórios',  price: 99.90  },
  ];

  constructor(public cartService: CartService) {}

  get cartItems(): CartItem[] { return this.cartService.getItems(); }
  get totalQty(): number { return this.cartService.getTotalItems(); }
  get totalValue(): number { return this.cartService.getTotalPrice(); }

  isInCart(id: number): boolean {
    return this.cartItems.some(i => i.id === id);
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product);
  }

  changeQty(id: string | number, delta: number): void {
    const item = this.cartItems.find(i => String(i.id) === String(id));
    if (item) {
      this.cartService.updateQuantity(id, (item.quantity ?? 1) + delta);
    }
  }

  removeItem(id: string | number): void {
    this.cartService.removeItem(id);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  sendWhatsApp(): void {
    if (!this.cartItems.length) return;
    const lines = this.cartItems
      .map(i => `▸ ${i.emoji} ${i.name} (x${i.quantity ?? 1}) — ${this.fmt((i.quantity ?? 1) * i.price)}`)
      .join('\n');
    const msg = `🛍️ *Novo Pedido:*\n\n${lines}\n\n💰 *Total: ${this.fmt(this.totalValue)}*`;
    window.open(`https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  fmt(val: number): string {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  trackById(_: number, item: CartItem): string | number { return item.id; }
  trackByProductId(_: number, product: Product): string | number { return product.id; }
}