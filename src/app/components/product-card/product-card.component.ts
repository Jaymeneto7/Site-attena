import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
            *ngFor="let size of availableSizes"
            class="size"
            [class.selected]="selectedSize === size.label"
            [class.available]="size.stock > 0"
            (click)="size.stock > 0 ? selectSize(size.label) : null"
          >{{ size.label }}</span>
        </div>

        <!-- Aviso sem tamanho -->
        <div class="size-warning" *ngIf="showSizeWarning">
          <span class="warning-icon">⚠️</span>
          <span class="warning-text">Selecione um tamanho!</span>
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
    .sizes { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
    .size { font-size: 10px; padding: 3px 8px; border-radius: 4px; border: 1px solid #d8d5c8; color: #888; cursor: pointer; transition: all 0.15s; }
    .size.available:hover { border-color: var(--color-muted); color: var(--color-muted); }
    .size.selected { border-color: var(--color-muted); background: var(--color-muted); color: var(--color-on-primary); font-weight: 600; }
    .size:not(.available) { cursor: not-allowed; opacity: 0.5; }
    .size-warning { 
      display: flex; 
      align-items: center; 
      gap: 6px; 
      background: rgba(140, 29, 18, 0.1); 
      color: var(--color-danger); 
      padding: 8px 12px; 
      border-radius: 8px; 
      border: 1px solid rgba(140, 29, 18, 0.2); 
      margin-bottom: 8px; 
      font-size: 12px; 
      font-weight: 500; 
      animation: warningPulse 0.3s ease-out; 
    }
    .warning-icon { font-size: 14px; }
    .warning-text { flex: 1; }
    @keyframes warningPulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); opacity: 1; }
    }
    .card-footer { display: flex; align-items: center; justify-content: space-between; }
    .prices { display: flex; align-items: baseline; gap: 6px; }
    .price { font-size: 16px; font-weight: 500; color: var(--color-danger); }
    .price-old { font-size: 11px; color: #bbb; text-decoration: line-through; }
    .add-btn { display: flex; align-items: center; gap: 5px; background: var(--color-primary); color: var(--color-on-primary); border: none; border-radius: 7px; padding: 7px 12px; font-size: 12px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
    .add-btn.added { background: var(--color-muted); }
    .add-btn:hover { opacity: 0.9; }
  `]
})
export class ProductCardComponent implements OnChanges {
  @Input() product!: Product;
  selectedSize: string | null = null;
  showSizeWarning = false;

  constructor(private cartService: CartService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.selectedSize = null;
      this.showSizeWarning = false;
    }
  }

  get hasSizeObjects(): boolean {
    return Array.isArray(this.product.sizes) && this.product.sizes.length > 0;
  }

  get availableSizes(): { label: string; stock: number }[] {
    return (this.product.sizes as { label: string; stock: number }[])
      .filter(s => s.stock > 0);
  }

  get badgeLabel(): string {
    const map: Record<string, string> = { novo: 'Novo', hot: 'Hot', sale: 'Sale' };
    return map[this.product.badge ?? ''] ?? '';
  }

  get isInCart(): boolean {
    const productId = Number(this.product.id);
    if (Number.isNaN(productId)) {
      return false;
    }

    if (this.hasSizeObjects) {
      if (!this.selectedSize) {
        return false;
      }
      return this.cartService.isInCart(productId, this.selectedSize);
    }

    return this.cartService.isInCart(productId, undefined);
  }

  selectSize(label: string): void {
    this.selectedSize = label;
    this.showSizeWarning = false;
  }

  addToCart(): void {
    if (this.hasSizeObjects && !this.selectedSize) {
      this.showSizeWarning = true;
      return;
    }

    const id = Number(this.product.id);
    const sizeToAdd = this.hasSizeObjects ? this.selectedSize || undefined : undefined;

    console.log('🛒 ADD:', { 
      id, 
      name: this.product.name, 
      size: sizeToAdd, 
      selectedSize: this.selectedSize,
      hasSizeObjects: this.hasSizeObjects 
    });

    this.cartService.addItem({
      id: id,
      name: this.product.name,
      emoji: this.product.emoji ?? '🛍️',
      category: this.product.category ?? '',
      price: this.product.price,
      size: sizeToAdd,
    });

    // IMPORTANTE: Reset do tamanho selecionado após adicionar
    console.log('🔄 Resetando selectedSize de', this.selectedSize, 'para null');
    this.selectedSize = null;
    this.showSizeWarning = false;
    
    // Mostrar mensagem de confirmação
    alert('Produto adicionado à sacola! 🛒');
  }
}