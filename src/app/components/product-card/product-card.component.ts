import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-img" [style.background]="product.bgColor || '#f4f4f0'">
        <span *ngIf="product.badge" class="badge" [ngClass]="'badge-' + product.badge">
          {{ badgeLabel }}
        </span>
        <img *ngIf="product.image" class="card-photo" [src]="product.image" [alt]="product.name" />
        <span *ngIf="!product.image" class="emoji">{{ product.emoji }}</span>
      </div>
      <div class="card-body">
        <div class="card-name">{{ product.name }}</div>
        <div class="card-cat">{{ product.categoryLabel }}</div>
        <div class="sizes" *ngIf="hasSizeObjects">
          <span
            *ngFor="let size of sizeObjects"
            class="size"
            [class.available]="size.available"
          >{{ size.label }}</span>
        </div>
        <div class="card-footer">
          <div class="prices">
            <span class="price">R$ {{ product.price }}</span>
            <span *ngIf="product.originalPrice" class="price-old">R$ {{ product.originalPrice }}</span>
          </div>
          <button class="add-btn" [class.added]="isInCart" (click)="addToCart()">
            <span *ngIf="!isInCart">🛒 Adicionar</span>
            <span *ngIf="isInCart">✓ Adicionado</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { background: var(--color-surface); border: 0.5px solid var(--color-border); border-radius: 12px; overflow: hidden; transition: border-color 0.15s, transform 0.15s; }
    .card:hover { border-color: var(--color-muted); transform: translateY(-2px); }
    .card-img { height: 160px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
    .card-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .emoji { font-size: 56px; position: relative; z-index: 1; }
    .badge { position: absolute; top: 10px; left: 10px; font-size: 9px; font-weight: 600; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; }
    .badge-novo { background: var(--color-muted); color: var(--color-on-primary); }
    .badge-hot  { background: var(--color-accent-warm); color: var(--color-on-primary); }
    .badge-sale { background: var(--color-danger); color: var(--color-on-primary); }
    .card-body { padding: 12px 14px 14px; }
    .card-name { font-size: 14px; font-weight: 500; color: var(--color-text); margin-bottom: 2px; }
    .card-cat { font-size: 11px; color: #aaa; margin-bottom: 10px; }
    .sizes { display: flex; gap: 4px; margin-bottom: 10px; }
    .size { font-size: 10px; padding: 2px 7px; border-radius: 4px; border: 0.5px solid #ddd; color: #ccc; }
    .size.available { border-color: var(--color-muted); color: var(--color-muted); }
    .card-footer { display: flex; align-items: center; justify-content: space-between; }
    .prices { display: flex; align-items: baseline; gap: 6px; }
    .price { font-size: 16px; font-weight: 500; color: var(--color-danger); }
    .price-old { font-size: 11px; color: #bbb; text-decoration: line-through; }
    .add-btn { display: flex; align-items: center; gap: 5px; background: var(--color-primary); color: var(--color-on-primary); border: none; border-radius: 7px; padding: 7px 12px; font-size: 12px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
    .add-btn.added { background: var(--color-muted); }
    .add-btn:hover { opacity: 0.9; }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(private cartService: CartService) {}

  get hasSizeObjects(): boolean {
    return Array.isArray(this.product.sizes) && this.product.sizes.length > 0;
  }

  get sizeObjects(): { label: string; available: boolean }[] {
    return this.product.sizes.map(s => ({
      label: s.label,
      available: s.stock > 0,
    }));
  }

  get badgeLabel(): string {
    const map: Record<string, string> = { novo: 'Novo', hot: 'Hot', sale: 'Sale' };
    return map[this.product.badge ?? ''] ?? '';
  }

  get isInCart(): boolean {
  return this.cartService.cartItems.some(i => i.id === Number(this.product.id));
}

 addToCart(): void {
    this.cartService.addItem({
      id: Number(this.product.id),
      name: this.product.name,
      emoji: this.product.emoji ?? '🛍️',
      category: this.product.category ?? '',
      price: this.product.price
    });
  }
}