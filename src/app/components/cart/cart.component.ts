import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  emoji: string;
  name: string;
  category: string;
  price: number;
}

interface CartItem extends Product {
  qty: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {

  // ===================== CONFIG =====================
  readonly WHATSAPP_NUMBER = '5511999999999'; // ← troque pelo número real (DDI+DDD+número)

  readonly PRODUCTS: Product[] = [
    { id: 1,  emoji: '👟', name: 'Tênis Urban Runner',        category: 'Calçados',    price: 299.90 },
    { id: 2,  emoji: '👕', name: 'Camiseta Oversized Premium', category: 'Vestuário',   price: 89.90  },
    { id: 3,  emoji: '🎧', name: 'Fone Bluetooth Pro',         category: 'Eletrônicos', price: 349.90 },
    { id: 4,  emoji: '🎒', name: 'Mochila Slim Carry',         category: 'Acessórios',  price: 189.90 },
    { id: 5,  emoji: '⌚', name: 'Relógio Smart Watch X3',     category: 'Eletrônicos', price: 599.90 },
    { id: 6,  emoji: '🕶️', name: 'Óculos de Sol Retrô',       category: 'Acessórios',  price: 149.90 },
    { id: 7,  emoji: '👖', name: 'Calça Jogger Slim',          category: 'Vestuário',   price: 129.90 },
    { id: 8,  emoji: '💻', name: 'Suporte para Notebook',      category: 'Eletrônicos', price: 79.90  },
    { id: 9,  emoji: '🧴', name: 'Kit Skincare Completo',      category: 'Beleza',      price: 239.90 },
    { id: 10, emoji: '📱', name: 'Capa Magnética iPhone',      category: 'Eletrônicos', price: 59.90  },
    { id: 11, emoji: '🏋️', name: 'Corda de Pular Speed',      category: 'Esportes',    price: 44.90  },
    { id: 12, emoji: '☕', name: 'Garrafa Térmica 1L',         category: 'Acessórios',  price: 99.90  },
  ];

  cart: { [id: number]: CartItem } = {};

  // ===================== GETTERS =====================
  get cartItems(): CartItem[] {
    return Object.values(this.cart);
  }

  get totalQty(): number {
    return this.cartItems.reduce((s, i) => s + i.qty, 0);
  }

  get totalValue(): number {
    return this.cartItems.reduce((s, i) => s + i.qty * i.price, 0);
  }

  isInCart(id: number): boolean {
    return !!this.cart[id];
  }

  // ===================== CART LOGIC =====================
  addToCart(product: Product): void {
    if (this.cart[product.id]) {
      this.cart[product.id].qty++;
    } else {
      this.cart[product.id] = { ...product, qty: 1 };
    }
    this.cart = { ...this.cart }; // trigger change detection
  }

  changeQty(id: number, delta: number): void {
    if (!this.cart[id]) return;
    this.cart[id].qty += delta;
    if (this.cart[id].qty <= 0) this.removeItem(id);
    else this.cart = { ...this.cart };
  }

  removeItem(id: number): void {
    const updated = { ...this.cart };
    delete updated[id];
    this.cart = updated;
  }

  clearCart(): void {
    this.cart = {};
  }

  // ===================== WHATSAPP =====================
  sendWhatsApp(): void {
    if (!this.cartItems.length) return;

    const lines = this.cartItems.map(i =>
      `▸ ${i.emoji} ${i.name} (x${i.qty}) — ${this.fmt(i.qty * i.price)}`
    ).join('\n');

    const msg =
`🛍️ *Olá! Gostaria de fazer um pedido:*

${lines}

━━━━━━━━━━━━━━
💰 *Total: ${this.fmt(this.totalValue)}*
━━━━━━━━━━━━━━

Por favor, me informe as formas de pagamento e prazo de entrega. Obrigado! 😊`;

    const url = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  // ===================== HELPERS =====================
  fmt(val: number): string {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  trackById(_: number, item: CartItem): number {
    return item.id;
  }

  trackByProductId(_: number, product: Product): number {
    return product.id;
  }
}