import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { StockNotificationService } from '../../services/stock-notification.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { LoginModalComponent } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, LoginModalComponent],
  template: `
    <app-navbar [showCartBtn]="true" (openCart)="cartService.openCart()" />
    <app-login-modal *ngIf="showLoginModal" (loginSuccess)="onLoginSuccess()" (closeModal)="showLoginModal = false" />

    <div class="page">

      <!-- Não encontrado -->
      <div *ngIf="!product" class="not-found">
        <div class="not-found-icon">🔍</div>
        <h2>Produto não encontrado</h2>
        <a routerLink="/" class="btn-back">Voltar ao catálogo</a>
      </div>

      <div *ngIf="product" class="detail-layout">

        <!-- Imagem -->
        <div class="image-area" [style.background]="product.bgColor || '#f4f4f0'">
          <span *ngIf="product.badge" class="badge" [ngClass]="'badge-' + product.badge">
            {{ badgeLabel }}
          </span>
          <img *ngIf="product.image" class="product-image" [src]="product.image" [alt]="product.name" />
          <span *ngIf="!product.image" class="product-emoji">{{ product.emoji }}</span>
          <button class="wish-btn" [class.wished]="wishlistService.has(product.id)" (click)="toggleWish()" title="Lista de desejos">
            {{ wishlistService.has(product.id) ? '♥' : '♡' }}
          </button>
        </div>

        <!-- Informações -->
        <div class="info-area">
          <a routerLink="/" class="breadcrumb">← Voltar ao catálogo</a>

          <div class="category-label">{{ product.categoryLabel }}</div>
          <h1 class="product-name">{{ product.name }}</h1>

          <div *ngIf="product.description" class="description">{{ product.description }}</div>

          <!-- Preço -->
          <div class="prices">
            <span class="price">R$ {{ product.price | number:'1.2-2':'pt-BR' }}</span>
            <span *ngIf="product.originalPrice" class="price-old">R$ {{ product.originalPrice | number:'1.2-2':'pt-BR' }}</span>
          </div>

          <!-- Cores -->
          <div *ngIf="product.colors?.length" class="colors-section">
            <div class="sizes-label">Cor<span *ngIf="selectedColor" class="selected-color-name"> — {{ selectedColor }}</span></div>
            <div class="colors-grid">
              <button
                *ngFor="let color of product.colors"
                type="button"
                class="color-btn"
                [class.selected]="selectedColor === color"
                (click)="selectedColor = color"
              >{{ color }}</button>
            </div>
          </div>

          <!-- Tamanhos -->
          <div *ngIf="hasSizes" class="sizes-section">
            <div class="sizes-label">Tamanho</div>
            <div class="sizes-grid">
              <button
                *ngFor="let size of product.sizes"
                class="size-btn"
                [class.selected]="selectedSize === size.label"
                [class.unavailable]="size.stock === 0"
                [disabled]="size.stock === 0"
                (click)="selectSize(size.label)"
              >
                {{ size.label }}
                <span *ngIf="size.stock === 0" class="sold-out-label">Esgotado</span>
              </button>
            </div>
            <div class="size-warning" *ngIf="showSizeWarning">
              <span>⚠️</span> Selecione um tamanho antes de adicionar
            </div>
          </div>

          <!-- Botão adicionar -->
          <button class="add-btn" [class.added]="isInCart" [class.out-of-stock]="isOutOfStock" [disabled]="isOutOfStock" (click)="addToCart()">
            <span *ngIf="isOutOfStock">Produto Indisponível</span>
            <span *ngIf="!isOutOfStock && !isInCart">🛒 Adicionar à sacola</span>
            <span *ngIf="!isOutOfStock && isInCart">✓ Adicionado à sacola</span>
          </button>

          <!-- Avise-me -->
          <button *ngIf="isOutOfStock" class="notify-btn" [class.subscribed]="notifService.isSubscribed(product!.id)" (click)="notifyMe()">
            <span>{{ notifService.isSubscribed(product!.id) ? '🔔' : '🔕' }}</span>
            <span>{{ notifService.isSubscribed(product!.id) ? 'Você será avisado quando disponível' : 'Avise-me quando estiver disponível' }}</span>
          </button>

          <!-- Info extra -->
          <div class="extra-info">
            <div class="info-row">
              <span class="info-icon">🚚</span>
              <span>Entrega a combinar via WhatsApp</span>
            </div>
            <div class="info-row">
              <span class="info-icon">🔄</span>
              <span>Troca em até 7 dias</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <app-footer />
  `,
  styles: [`
    .page { background: #FCFAE5; min-height: calc(100vh - 58px); padding: 2rem 1rem; }

    .not-found { text-align: center; padding: 5rem 1rem; }
    .not-found-icon { font-size: 3rem; margin-bottom: 1rem; }
    .not-found h2 { font-family: Georgia, serif; color: #395531; margin: 0 0 1.5rem; }
    .btn-back {
      display: inline-block; background: #395531; color: #FCFAE5;
      padding: 10px 22px; border-radius: 8px; text-decoration: none;
      font-size: 0.875rem; font-weight: 500;
    }

    .detail-layout {
      max-width: 960px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem;
      align-items: start;
    }

    /* Imagem */
    .image-area {
      border-radius: 16px; overflow: hidden;
      aspect-ratio: 1 / 1;
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .product-image { width: 100%; height: 100%; object-fit: cover; }
    .product-emoji { font-size: 120px; }
    .badge {
      position: absolute; top: 14px; left: 14px;
      font-size: 10px; font-weight: 600; padding: 4px 12px;
      border-radius: 20px; text-transform: uppercase; z-index: 2;
    }
    .badge-novo { background: var(--color-muted); color: var(--color-on-primary); }
    .badge-hot  { background: var(--color-accent-warm); color: var(--color-on-primary); }
    .badge-sale { background: var(--color-danger); color: var(--color-on-primary); }
    .wish-btn {
      position: absolute; top: 12px; right: 12px; z-index: 2;
      background: rgba(255,255,255,0.85); border: none; border-radius: 50%;
      width: 38px; height: 38px; font-size: 20px; line-height: 1;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: #bbb; transition: color 0.15s, background 0.15s; backdrop-filter: blur(4px);
    }
    .wish-btn:hover { color: #CA5417; background: rgba(255,255,255,0.95); }
    .wish-btn.wished { color: #CA5417; }

    /* Info */
    .info-area { display: flex; flex-direction: column; gap: 1.25rem; padding-top: 0.5rem; }
    .breadcrumb { font-size: 0.8rem; color: #aaa; text-decoration: none; transition: color 0.15s; }
    .breadcrumb:hover { color: #395531; }
    .category-label { font-size: 0.8rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.06em; }
    .product-name { font-family: Georgia, serif; font-size: 2rem; color: #395531; margin: 0; line-height: 1.2; }
    .description { font-size: 0.9rem; color: #666; line-height: 1.6; }

    .prices { display: flex; align-items: baseline; gap: 10px; }
    .price { font-size: 1.75rem; font-weight: 600; color: var(--color-danger); }
    .price-old { font-size: 1rem; color: #bbb; text-decoration: line-through; }

    .sizes-section { display: flex; flex-direction: column; gap: 10px; }
    .sizes-label { font-size: 0.8rem; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.05em; }
    .sizes-grid { display: flex; gap: 8px; flex-wrap: wrap; }
    .size-btn {
      position: relative;
      min-width: 48px; padding: 8px 14px;
      border: 1.5px solid #d8d5c8; border-radius: 8px;
      background: #fff; font-size: 0.875rem; font-weight: 500; color: #555;
      cursor: pointer; transition: all 0.15s;
    }
    .size-btn:hover:not(:disabled) { border-color: #395531; color: #395531; }
    .size-btn.selected { border-color: #395531; background: #395531; color: #FCFAE5; font-weight: 600; }
    .size-btn.unavailable { opacity: 0.4; cursor: not-allowed; }
    .sold-out-label {
      position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%);
      font-size: 9px; color: #aaa; white-space: nowrap;
    }
    .size-warning {
      display: flex; align-items: center; gap: 6px;
      background: rgba(140,29,18,0.08); color: var(--color-danger);
      padding: 8px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 500;
    }

    .add-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: #395531; color: #FCFAE5; border: none; border-radius: 10px;
      padding: 14px 24px; font-size: 1rem; font-weight: 600; cursor: pointer;
      transition: opacity 0.15s, background 0.15s; width: 100%;
    }
    .add-btn.added { background: var(--color-muted); }
    .add-btn:hover:not(:disabled) { opacity: 0.9; }
    .add-btn.out-of-stock { background: #ccc; color: #888; cursor: not-allowed; }

    .notify-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; background: none; border: 1.5px dashed #e0bba0;
      border-radius: 10px; padding: 12px 20px;
      font-size: 0.9rem; color: #CA5417; cursor: pointer; transition: all 0.15s;
    }
    .notify-btn:hover { background: #fff5f0; border-style: solid; }
    .notify-btn.subscribed { border-style: solid; background: #fff5f0; font-weight: 600; }

    .colors-section { display: flex; flex-direction: column; gap: 10px; }
    .colors-grid { display: flex; gap: 8px; flex-wrap: wrap; }
    .color-btn {
      padding: 8px 16px; border-radius: 8px;
      border: 1.5px solid #d8d5c8; background: #fff;
      font-size: 0.875rem; font-weight: 500; color: #555;
      cursor: pointer; transition: all 0.15s;
    }
    .color-btn:hover { border-color: #395531; color: #395531; }
    .color-btn.selected { border-color: #395531; background: #395531; color: #FCFAE5; font-weight: 600; }
    .selected-color-name { font-weight: 600; color: #395531; text-transform: capitalize; }

    .extra-info { display: flex; flex-direction: column; gap: 8px; padding-top: 0.25rem; border-top: 0.5px solid #e4e1d5; }
    .info-row { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: #888; }
    .info-icon { font-size: 1rem; }

    @media (max-width: 700px) {
      .detail-layout { grid-template-columns: 1fr; gap: 1.5rem; }
      .product-name { font-size: 1.5rem; }
      .page { padding: 1rem; }
      .image-area { aspect-ratio: 4/3; }
      .price { font-size: 1.4rem; }
      .add-btn { font-size: 0.95rem; padding: 13px 20px; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  selectedSize: string | null = null;
  selectedColor: string | null = null;
  showSizeWarning = false;
  showLoginModal = false;
  private pendingNotify = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public cartService: CartService,
    public wishlistService: WishlistService,
    public authService: AuthService,
    public notifService: StockNotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.product = this.productService.getProductById(id ?? '');

    if (!this.product) {
      // Tenta de novo quando os produtos carregarem do Supabase
      this.productService.productsLoaded.subscribe(products => {
        this.product = products.find(p => String(p.id) === String(id));
      });
    }
  }

  get hasSizes(): boolean {
    return Array.isArray(this.product?.sizes) && (this.product?.sizes.length ?? 0) > 0;
  }

  get isOutOfStock(): boolean {
    if (!this.product?.sizes?.length) return false;
    return this.product.sizes.every(s => s.stock === 0);
  }

  get badgeLabel(): string {
    const map: Record<string, string> = { novo: 'Novo', hot: 'Hot', sale: 'Sale' };
    return map[this.product?.badge ?? ''] ?? '';
  }

  get isInCart(): boolean {
    if (!this.product) return false;
    if (this.hasSizes) {
      if (!this.selectedSize) return false;
      return this.cartService.isInCart(this.product.id, this.selectedSize, this.selectedColor ?? undefined);
    }
    return this.cartService.isInCart(this.product.id, undefined, this.selectedColor ?? undefined);
  }

  selectSize(label: string): void {
    this.selectedSize = label;
    this.showSizeWarning = false;
  }

  toggleWish(): void {
    if (this.product) this.wishlistService.toggle(this.product.id);
  }

  notifyMe(): void {
    if (!this.authService.isLogged) {
      this.pendingNotify = true;
      this.showLoginModal = true;
      return;
    }
    this.doSubscribe();
  }

  onLoginSuccess(): void {
    this.showLoginModal = false;
    if (this.pendingNotify) {
      this.pendingNotify = false;
      const user = this.authService.currentUser!;
      this.notifService.loadSubscriptions(user.id).then(() => this.doSubscribe());
    }
  }

  private doSubscribe(): void {
    const user = this.authService.currentUser;
    if (!user || !this.product) return;
    this.notifService.subscribe(this.product.id, user.id, user.email);
  }

  addToCart(): void {
    if (!this.product) return;
    if (this.hasSizes && !this.selectedSize) {
      this.showSizeWarning = true;
      return;
    }
    if (this.isInCart) {
      this.cartService.openCart();
      return;
    }

    const sizeToAdd = this.hasSizes ? this.selectedSize || undefined : undefined;

    this.cartService.addItem({
      id: this.product.id,
      name: this.product.name,
      emoji: this.product.emoji ?? '🛍️',
      category: this.product.category ?? '',
      price: this.product.price,
      size: sizeToAdd,
      color: this.selectedColor ?? undefined,
    });

    this.cartService.openCart();
  }
}
