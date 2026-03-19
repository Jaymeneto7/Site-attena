import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

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
          <button class="wpp-btn" (click)="order()">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Pedir
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
    .wpp-btn { display: flex; align-items: center; gap: 5px; background: #25D366; color: #fff; border: none; border-radius: 7px; padding: 7px 12px; font-size: 12px; font-weight: 500; cursor: pointer; }
    .wpp-btn svg { width: 12px; height: 12px; }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(private productService: ProductService) {}

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

  order() {
    const msg = this.product.whatsappMessage
      ?? `Olá! Tenho interesse no produto *${this.product.name}* (R$${this.product.price}). Poderia me ajudar?`;
    this.productService.openWhatsApp(msg);
  }
}