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
      <div class="card-img" [style.background]="product.bgColor">
        <span *ngIf="product.badge" class="badge" [ngClass]="'badge-' + product.badge">
          {{ badgeLabel }}
        </span>
        <span class="emoji">{{ product.emoji }}</span>
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
    .card { background: #fff; border: 0.5px solid #d8d5c8; border-radius: 12px; overflow: hidden; transition: border-color 0.15s, transform 0.15s; }
    .card:hover { border-color: #62984B; transform: translateY(-2px); }
    .card-img { height: 160px; display: flex; align-items: center; justify-content: center; position: relative; }
    .emoji { font-size: 56px; }
    .badge { position: absolute; top: 10px; left: 10px; font-size: 9px; font-weight: 600; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; }
    .badge-novo { background: #62984B; color: #FCFAE5; }
    .badge-hot  { background: #CA5417; color: #FCFAE5; }
    .badge-sale { background: #8C1D12; color: #FCFAE5; }
    .card-body { padding: 12px 14px 14px; }
    .card-name { font-size: 14px; font-weight: 500; color: #395531; margin-bottom: 2px; }
    .card-cat { font-size: 11px; color: #aaa; margin-bottom: 10px; }
    .sizes { display: flex; gap: 4px; margin-bottom: 10px; }
    .size { font-size: 10px; padding: 2px 7px; border-radius: 4px; border: 0.5px solid #ddd; color: #ccc; }
    .size.available { border-color: #62984B; color: #62984B; }
    .card-footer { display: flex; align-items: center; justify-content: space-between; }
    .prices { display: flex; align-items: baseline; gap: 6px; }
    .price { font-size: 16px; font-weight: 500; color: #8C1D12; }
    .price-old { font-size: 11px; color: #bbb; text-decoration: line-through; }
    .add-btn { display: flex; align-items: center; gap: 5px; background: #395531; color: #FCFAE5; border: none; border-radius: 7px; padding: 7px 12px; font-size: 12px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
    .add-btn.added { background: #62984B; }
    .add-btn:hover { opacity: 0.9; }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(private cartService: CartService) {}

  get hasSizeObjects(): boolean {
    return Array.isArray(this.product.sizes) &&
      this.product.sizes.length > 0 &&
      typeof this.product.sizes[0] === 'object';
  }

  get sizeObjects(): { label: string; available: boolean }[] {
    return this.product.sizes as { label: string; available: boolean }[];
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