import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface CartItem {
  id: string | number;
  name: string;
  emoji: string;
  category: string;
  price: number;
  size?: string;
  color?: string;
  quantity?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private items: CartItem[] = [];
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly openCart$ = new Subject<void>();

  openCart(): void { this.openCart$.next(); }

  public items$ = this.itemsSubject.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  addItem(item: CartItem): void {
    const itemId = String(item.id);
    const normalizedSize = item.size ?? null;
    const normalizedColor = item.color ?? null;

    const existingItem = this.items.find(
      (i) => String(i.id) === itemId &&
             (i.size ?? null) === normalizedSize &&
             (i.color ?? null) === normalizedColor
    );

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity ?? 1) + 1;
    } else {
      this.items.push({
        ...item,
        id: itemId,
        size: normalizedSize ?? undefined,
        color: normalizedColor ?? undefined,
        quantity: item.quantity ?? 1,
        price: Number(item.price) || 0,
      });
    }

    this.saveToLocalStorage();
    this.itemsSubject.next([...this.items]);
  }

  removeItem(id: string | number, size?: string, color?: string): void {
    const itemId = String(id);
    const normalizedSize = size ?? null;
    const normalizedColor = color ?? null;
    const initialLength = this.items.length;

    this.items = this.items.filter(
      (item) => !(String(item.id) === itemId &&
                  (item.size ?? null) === normalizedSize &&
                  (item.color ?? null) === normalizedColor)
    );

    this.itemsSubject.next([...this.items]);
    if (this.items.length !== initialLength) this.saveToLocalStorage();
  }

  updateQuantity(id: string | number, quantity: number, size?: string, color?: string): void {
    const itemId = String(id);
    const normalizedSize = size ?? null;
    const normalizedColor = color ?? null;
    const item = this.items.find(
      (i) => String(i.id) === itemId &&
             (i.size ?? null) === normalizedSize &&
             (i.color ?? null) === normalizedColor
    );
    if (item) {
      if (quantity <= 0) {
        this.removeItem(id, size, color);
      } else {
        item.quantity = quantity;
        this.saveToLocalStorage();
        this.itemsSubject.next([...this.items]);
      }
    }
  }

  isInCart(id: string | number, size?: string, color?: string): boolean {
    const itemId = String(id);
    const normalizedSize = size ?? null;
    const normalizedColor = color ?? null;
    return this.items.some(
      (item) => String(item.id) === itemId &&
                (item.size ?? null) === normalizedSize &&
                (item.color ?? null) === normalizedColor
    );
  }

  getItems(): CartItem[] { return [...this.items]; }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + item.price * (item.quantity ?? 1), 0);
  }

  getTotalItems(): number {
    return this.items.reduce((total, item) => total + (item.quantity ?? 1), 0);
  }

  clearCart(): void {
    this.items = [];
    this.saveToLocalStorage();
    this.itemsSubject.next([]);
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  private loadFromLocalStorage(): void {
    const saved = localStorage.getItem('cart');
    if (!saved) return;
    try {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        this.items = parsed.map((item) => ({
          ...item,
          id: String((item as CartItem).id ?? ''),
          size: (item as CartItem).size ?? undefined,
          quantity: Number((item as CartItem).quantity) || 1,
          price: Number((item as CartItem).price) || 0,
        } as CartItem));
        this.itemsSubject.next([...this.items]);
      }
    } catch {
      this.items = [];
    }
  }
}
