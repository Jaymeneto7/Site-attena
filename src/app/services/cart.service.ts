import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  emoji: string;
  category: string;
  price: number;
  size?: string;
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
    const itemId = Number(item.id);
    const normalizedItemId = Number.isNaN(itemId) ? 0 : itemId;
    const normalizedSize = item.size ?? null;

    console.log('📦 ADD ITEM:', { id: normalizedItemId, name: item.name, size: normalizedSize });

    const existingItem = this.items.find(
      (i) => {
        const iSize = i.size ?? null;
        const matches = i.id === normalizedItemId && iSize === normalizedSize;
        if (matches) {
          console.log('  ✏️ Encontrado item duplicado, vai incrementar quantidade');
        }
        return matches;
      }
    );

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity ?? 1) + 1;
      console.log('  Quantidade agora:', existingItem.quantity);
    } else {
      console.log('  ✨ Novo item adicionado');
      const newItem: CartItem = {
        ...item,
        id: normalizedItemId,
        size: normalizedSize ?? undefined,
        quantity: item.quantity ?? 1,
        price: Number(item.price) || 0,
      };
      this.items.push(newItem);
    }

    console.log('  Carrinho agora tem:', this.items.map(i => `${i.name}(${i.size || 'sem tamanho'}) x${i.quantity}`).join(', '));

    this.saveToLocalStorage();
    this.itemsSubject.next([...this.items]);
  }

  removeItem(id: number, size?: string): void {
    const normalizedSize = size ?? null;
    const initialLength = this.items.length;

    this.items = this.items.filter(
      (item) => !(item.id === id && (item.size ?? null) === normalizedSize)
    );

    // Força atualização do observable mesmo se não houve mudança
    this.itemsSubject.next([...this.items]);

    if (this.items.length !== initialLength) {
      this.saveToLocalStorage();
    }
  }

  updateQuantity(id: number, quantity: number, size?: string): void {
    const normalizedSize = size ?? null;
    const item = this.items.find(
      (i) => i.id === id && (i.size ?? null) === normalizedSize
    );
    if (item) {
      item.quantity = quantity;
      if (quantity <= 0) {
        this.removeItem(id, size);
      } else {
        this.saveToLocalStorage();
        this.itemsSubject.next([...this.items]);
      }
    }
  }

  isInCart(id: number, size?: string): boolean {
    const normalizedId = Number(id);
    if (Number.isNaN(normalizedId)) {
      return false;
    }
    const normalizedSize = size ?? null;
    return this.items.some(
      (item) => Number(item.id) === normalizedId && (item.size ?? null) === normalizedSize
    );
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getTotalPrice(): number {
    return this.items.reduce(
      (total, item) => total + item.price * (item.quantity ?? 1),
      0
    );
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
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.items = parsed.map((item) => {
            const id = Number((item as any).id);
            const size = (item as any).size;
            const quantity = Number((item as any).quantity) || 1;
            const price = Number((item as any).price) || 0;
            return {
              ...item,
              id: Number.isNaN(id) ? 0 : id,
              size: size == null ? undefined : String(size),
              quantity,
              price,
            } as CartItem;
          });
        } else {
          this.items = [];
        }
        this.itemsSubject.next([...this.items]);
      } catch (e) {
        console.error('Erro ao carregar carrinho:', e);
        this.items = [];
      }
    }
  }
}