import { Injectable } from '@angular/core';

export interface CartItem {
  id: number;
  name: string;
  emoji: string;
  category: string;
  price: number;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart: { [id: number]: CartItem } = {};

  get cartItems(): CartItem[] { return Object.values(this.cart); }
  get totalQty(): number { return this.cartItems.reduce((s, i) => s + i.qty, 0); }
  get totalValue(): number { return this.cartItems.reduce((s, i) => s + i.qty * i.price, 0); }

  addItem(product: Omit<CartItem, 'qty'>): void {
    if (this.cart[product.id]) { this.cart[product.id].qty++; }
    else { this.cart[product.id] = { ...product, qty: 1 }; }
    this.cart = { ...this.cart };
  }

  updateQty(id: number, delta: number): void {
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

  clear(): void { this.cart = {}; }
}