import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';
import { OrderService, Order, ORDER_STATUS_LABELS, OrderStatus } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductCardComponent } from '../product-card/product-card.component';

type Tab = 'conta' | 'desejos' | 'pedidos';

@Component({
  selector: 'app-minha-conta',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, ProductCardComponent],
  template: `
    <app-navbar [showCartBtn]="true" (openCart)="cartService.openCart()" />

    <div class="page">
      <div class="container">

        <!-- Não logado -->
        <div *ngIf="!authService.isLogged" class="not-logged">
          <div class="not-logged-icon">🔒</div>
          <h2>Acesso restrito</h2>
          <p>Faça login para acessar sua conta.</p>
          <button class="btn-primary" (click)="goHome()">Ir para a loja</button>
        </div>

        <!-- Logado -->
        <div *ngIf="authService.isLogged">
          <div class="page-header">
            <h1>Minha Conta</h1>
            <p class="subtitle">Olá, <strong>{{ (authService.currentUser?.name ?? '').split(' ')[0] }}</strong></p>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button class="tab" [class.active]="tab === 'conta'" (click)="tab = 'conta'">
              👤 Dados pessoais
            </button>
            <button class="tab" [class.active]="tab === 'desejos'" (click)="tab = 'desejos'">
              ♡ Lista de desejos
              <span *ngIf="wishlistService.count() > 0" class="badge">{{ wishlistService.count() }}</span>
            </button>
            <button class="tab" [class.active]="tab === 'pedidos'" (click)="loadOrders()">
              📦 Meus pedidos
              <span *ngIf="orders.length > 0" class="badge">{{ orders.length }}</span>
            </button>
          </div>

          <!-- Aba: Dados pessoais -->
          <div *ngIf="tab === 'conta'" class="tab-panel">
            <form class="profile-form" (ngSubmit)="saveProfile()" #profileForm="ngForm">
              <div class="form-section">
                <h3>Informações básicas</h3>

                <div class="field">
                  <label>Nome completo</label>
                  <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Seu nome" />
                </div>

                <div class="field" *ngIf="!isAdmin">
                  <label>E-mail</label>
                  <input type="email" [(ngModel)]="form.email" name="email" required placeholder="seu@email.com" />
                </div>

                <div class="field" *ngIf="isAdmin">
                  <label>E-mail</label>
                  <input type="email" [value]="authService.currentUser?.email" disabled class="disabled" />
                  <span class="field-hint">E-mail gerenciado pelo Supabase Auth</span>
                </div>
              </div>

              <div class="form-section">
                <h3>Alterar senha <span class="optional">(opcional)</span></h3>
                <div class="field">
                  <label>Nova senha</label>
                  <input type="password" [(ngModel)]="form.password" name="password"
                    placeholder="Deixe em branco para manter" autocomplete="new-password" />
                </div>
                <div class="field">
                  <label>Confirmar nova senha</label>
                  <input type="password" [(ngModel)]="form.confirm" name="confirm"
                    placeholder="Repita a nova senha" autocomplete="new-password" />
                </div>
              </div>

              <div class="form-feedback error" *ngIf="feedbackError">{{ feedbackError }}</div>
              <div class="form-feedback success" *ngIf="feedbackSuccess">{{ feedbackSuccess }}</div>

              <div class="form-actions">
                <button type="submit" class="btn-primary" [disabled]="saving">
                  {{ saving ? 'Salvando…' : 'Salvar alterações' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Aba: Lista de desejos -->
          <div *ngIf="tab === 'desejos'" class="tab-panel">
            <div *ngIf="wishlistProducts.length === 0" class="empty-state">
              <div class="empty-icon">♡</div>
              <h3>Sua lista de desejos está vazia</h3>
              <p>Clique no coração dos produtos para salvá-los aqui.</p>
              <button class="btn-primary" (click)="goHome()">Explorar produtos</button>
            </div>
            <div *ngIf="wishlistProducts.length > 0" class="wishlist-grid">
              <app-product-card
                *ngFor="let p of wishlistProducts; trackBy: trackById"
                [product]="p"
              />
            </div>
          </div>

          <!-- Aba: Pedidos -->
          <div *ngIf="tab === 'pedidos'" class="tab-panel">
            <div *ngIf="loadingOrders" class="loading">Carregando pedidos…</div>

            <div *ngIf="!loadingOrders && orders.length === 0" class="empty-state">
              <div class="empty-icon">📦</div>
              <h3>Nenhum pedido ainda</h3>
              <p>Seus pedidos enviados pelo WhatsApp aparecerão aqui.</p>
              <button class="btn-primary" (click)="goHome()">Fazer um pedido</button>
            </div>

            <div *ngIf="!loadingOrders && orders.length > 0" class="orders-list">
              <div class="order-card" *ngFor="let o of orders">
                <div class="order-header">
                  <span class="order-date">{{ o.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                  <div class="order-header-right">
                    <span class="status-badge status-{{ o.status }}">{{ statusLabel(o.status) }}</span>
                    <span class="order-total">{{ o.total | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
                  </div>
                </div>
                <ul class="order-items">
                  <li *ngFor="let item of o.items">
                    {{ item.name }}<span *ngIf="item.size"> ({{ item.size }})</span><span *ngIf="item.color"> — {{ item.color }}</span>
                    × {{ item.quantity ?? 1 }}
                    <span class="item-price">R$ {{ item.price.toFixed(2) }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <app-footer />
  `,
  styles: [`
    .page { background: #FCFAE5; min-height: calc(100vh - 58px); padding: 2rem 1rem; }
    .container { max-width: 760px; margin: 0 auto; }

    .not-logged { text-align: center; padding: 4rem 1rem; }
    .not-logged-icon { font-size: 3rem; margin-bottom: 1rem; }
    .not-logged h2 { font-family: Georgia, serif; color: #395531; margin: 0 0 0.5rem; }
    .not-logged p { color: #777; margin: 0 0 1.5rem; }

    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-family: Georgia, serif; font-size: 1.6rem; color: #395531; margin: 0 0 0.2rem; }
    .subtitle { font-size: 0.9rem; color: #777; margin: 0; }

    .tabs { display: flex; gap: 4px; border-bottom: 1.5px solid #e4e1d5; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .tab {
      background: none; border: none; padding: 0.6rem 1.1rem;
      font-size: 0.875rem; color: #777; cursor: pointer;
      border-bottom: 2px solid transparent; margin-bottom: -1.5px;
      transition: color 0.15s, border-color 0.15s;
      display: flex; align-items: center; gap: 6px;
    }
    .tab:hover { color: #395531; }
    .tab.active { color: #395531; font-weight: 600; border-bottom-color: #395531; }
    .badge { background: #CA5417; color: #fff; border-radius: 20px; padding: 1px 7px; font-size: 10px; font-weight: 700; }

    .tab-panel { animation: fadeIn 0.15s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

    .profile-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-section {
      background: #fff; border: 0.5px solid #e4e1d5; border-radius: 12px;
      padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem;
    }
    .form-section h3 { font-size: 0.875rem; font-weight: 600; color: #395531; margin: 0 0 0.25rem; }
    .optional { font-weight: 400; color: #aaa; font-size: 0.8rem; }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field label { font-size: 0.8rem; font-weight: 500; color: #555; }
    .field input {
      border: 1px solid #d8d5c8; border-radius: 8px; padding: 9px 12px;
      font-size: 0.875rem; color: #333; background: #fff; transition: border-color 0.15s;
    }
    .field input:focus { outline: none; border-color: #395531; }
    .field input.disabled { background: #f5f4f0; color: #aaa; cursor: not-allowed; }
    .field-hint { font-size: 0.75rem; color: #aaa; }

    .form-feedback { font-size: 0.85rem; padding: 10px 14px; border-radius: 8px; }
    .form-feedback.error { background: rgba(140,29,18,0.08); color: #8c1d12; border: 1px solid rgba(140,29,18,0.15); }
    .form-feedback.success { background: rgba(57,85,49,0.08); color: #395531; border: 1px solid rgba(57,85,49,0.15); }

    .form-actions { display: flex; justify-content: flex-end; }

    .btn-primary {
      background: #395531; color: #FCFAE5; border: none; border-radius: 8px;
      padding: 10px 22px; font-size: 0.875rem; font-weight: 500; cursor: pointer;
      transition: opacity 0.15s;
    }
    .btn-primary:hover { opacity: 0.88; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .empty-state { text-align: center; padding: 4rem 1rem; }
    .empty-icon { font-size: 3rem; color: #d8d5c8; margin-bottom: 1rem; }
    .empty-state h3 { font-family: Georgia, serif; color: #395531; margin: 0 0 0.5rem; }
    .empty-state p { color: #777; margin: 0 0 1.5rem; font-size: 0.9rem; }

    .wishlist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }

    .loading { text-align: center; padding: 3rem; color: #aaa; font-size: 14px; }

    .orders-list { display: flex; flex-direction: column; gap: 12px; }
    .order-card {
      background: #fff; border: 0.5px solid #e4e1d5; border-radius: 12px;
      padding: 1rem 1.25rem;
    }
    .order-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 0.75rem; gap: 0.5rem;
    }
    .order-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .status-badge {
      display: inline-block; padding: 3px 10px; border-radius: 20px;
      font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .status-pendente  { background: #fff3cd; color: #856404; }
    .status-pago      { background: #d1e7dd; color: #0f5132; }
    .status-enviado   { background: #cfe2ff; color: #084298; }
    .status-entregue  { background: #d1e7dd; color: #0a3622; }
    .status-cancelado { background: #f8d7da; color: #842029; }
    .order-date { font-size: 0.8rem; color: #aaa; }
    .order-total { font-size: 1rem; font-weight: 600; color: #395531; }
    .order-items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
    .order-items li { font-size: 0.85rem; color: #555; display: flex; justify-content: space-between; }
    .item-price { color: #CA5417; font-weight: 500; }

    @media (max-width: 640px) {
      .wishlist-grid { grid-template-columns: repeat(2, 1fr); }
      .form-section { padding: 1rem; }
      .page { padding: 1rem; }
      .tabs { gap: 4px; }
      .tab { padding: 8px 12px; font-size: 13px; }
      .order-card { padding: 1rem; }
    }

    @media (max-width: 360px) {
      .wishlist-grid { grid-template-columns: 1fr; }
      .tabs { flex-direction: column; }
    }
  `]
})
export class MinhaContaComponent implements OnInit, OnDestroy {
  tab: Tab = 'conta';
  form = { name: '', email: '', password: '', confirm: '' };
  feedbackError = '';
  feedbackSuccess = '';
  saving = false;
  wishlistProducts: Product[] = [];
  orders: Order[] = [];
  loadingOrders = false;

  private wishSub?: Subscription;
  private allProducts: Product[] = [];

  constructor(
    public authService: AuthService,
    public wishlistService: WishlistService,
    public cartService: CartService,
    private orderService: OrderService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.form.name = user.name;
      this.form.email = user.email;
    }

    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    if (tabParam === 'desejos' || tabParam === 'pedidos' || tabParam === 'conta') {
      this.tab = tabParam;
      if (tabParam === 'pedidos') this.loadOrders();
    }

    this.productService.productsLoaded.subscribe(products => {
      this.allProducts = products.filter(p => !p.hidden);
      this._syncWishlist();
    });
    this.allProducts = this.productService.getProducts().filter(p => !p.hidden);
    this._syncWishlist();

    this.wishSub = this.wishlistService.ids$.subscribe(() => this._syncWishlist());
  }

  ngOnDestroy(): void { this.wishSub?.unsubscribe(); }

  get isAdmin(): boolean { return this.authService.isAdmin; }

  async saveProfile(): Promise<void> {
    this.feedbackError = '';
    this.feedbackSuccess = '';

    if (!this.form.name.trim()) { this.feedbackError = 'O nome não pode ficar vazio.'; return; }
    if (!this.isAdmin && !this.form.email.trim()) { this.feedbackError = 'O e-mail não pode ficar vazio.'; return; }
    if (this.form.password && this.form.password !== this.form.confirm) {
      this.feedbackError = 'As senhas não coincidem.'; return;
    }
    if (this.form.password && this.form.password.length < 6) {
      this.feedbackError = 'A nova senha deve ter ao menos 6 caracteres.'; return;
    }

    this.saving = true;
    let result: { ok: boolean; error?: string };
    try {
      result = await this.authService.updateProfile(
        this.form.name.trim(),
        this.form.email.trim(),
        this.form.password || undefined
      );
    } catch {
      result = { ok: false, error: 'Erro de conexão. Tente novamente.' };
    } finally {
      this.saving = false;
    }

    if (result!.ok) {
      this.form.password = '';
      this.form.confirm = '';
      const emailChanged = this.form.email !== this.authService.currentUser?.email;
      this.feedbackSuccess = emailChanged
        ? 'Dados atualizados! Confirme o novo e-mail na sua caixa de entrada.'
        : 'Dados atualizados com sucesso!';
      setTimeout(() => { this.feedbackSuccess = ''; }, 4000);
    } else {
      this.feedbackError = result.error ?? 'Erro ao salvar.';
    }
  }

  statusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status];
  }

  async loadOrders(): Promise<void> {
    this.tab = 'pedidos';
    if (this.orders.length > 0) return;
    this.loadingOrders = true;
    this.orders = await this.orderService.getMyOrders();
    this.loadingOrders = false;
  }

  goHome(): void { this.router.navigate(['/']); }

  trackById(_: number, p: Product): string | number { return p.id; }

  private _syncWishlist(): void {
    const ids = this.wishlistService.getAll();
    this.wishlistProducts = this.allProducts.filter(p => ids.includes(String(p.id)));
  }
}
