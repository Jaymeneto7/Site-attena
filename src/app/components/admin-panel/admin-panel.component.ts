import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Product, ProductSize } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { OrderService, Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_NEXT } from '../../services/order.service';

type CategoryKey = NonNullable<Product['category']>;

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, LoginModalComponent],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit, OnDestroy {

  showLoginModal = false;
  showProductForm = false;
  activeCategory = 'todos';
  adminView: 'produtos' | 'pedidos' = 'produtos';
  products: Product[] = [];
  editingProduct: Product | null = null;
  private productsSub?: Subscription;

  orders: Order[] = [];
  loadingOrders = false;
  orderFilter: OrderStatus | 'todos' = 'todos';

  formError = '';
  showSuccessToast = false;
  successToastMessage = '';

  readonly categories: { key: CategoryKey; label: string }[] = [
    { key: 'tops', label: 'Top' },
    { key: 'leggings', label: 'Calça' },
    { key: 'shorts', label: 'Shorts' },
    { key: 'conjuntos', label: 'Conjuntos' },
    { key: 'masculino', label: 'Masculino' },
  ];

  formData = {
    name: '',
    description: '',
    price: 0,
    originalPrice: null as number | null,
    category: 'tops' as CategoryKey,
    categoryLabel: '',
    colorsInput: '',
    image: '',
    emoji: '🛍️',
    bgColor: '#f0ede0',
    badge: '' as '' | 'novo' | 'hot' | 'sale',
  };

  formSizes: { label: string; stock: number }[] = [
    { label: 'P', stock: 0 },
    { label: 'M', stock: 0 },
    { label: 'G', stock: 0 },
    { label: 'GG', stock: 0 },
  ];

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  if (!this.authService.isLogged || !this.authService.isAdmin) {
    if (this.authService.isLogged && !this.authService.isAdmin) {
      this.authService.logout().catch(console.error);
    }
    this.showLoginModal = true;
  } else {
    this.productService.reloadFromSupabase().then(() => this.loadProducts());

    this.productsSub = this.productService.productsLoaded.subscribe(() => {
      this.loadProducts();
    });
  }
}

ngOnDestroy(): void {
  this.productsSub?.unsubscribe();
}

  get canUsePanel(): boolean {
    return this.authService.isLogged && this.authService.isAdmin;
  }

  get filteredProducts(): Product[] {
    if (this.activeCategory === 'ocultos') return this.products.filter(p => p.hidden);
    if (this.activeCategory === 'todos') return this.products.filter(p => !p.hidden);
    return this.products.filter(p => !p.hidden && p.category === this.activeCategory);
  }

  get activeCategoryLabel(): string {
    if (this.activeCategory === 'todos') return 'Todos os produtos';
    if (this.activeCategory === 'ocultos') return 'Produtos ocultos';
    return this.categories.find(c => c.key === this.activeCategory)?.label ?? this.activeCategory;
  }

  get hiddenCount(): number {
    return this.products.filter(p => p.hidden).length;
  }

  productsByCategory(key: CategoryKey): Product[] {
    return this.products.filter(p => !p.hidden && p.category === key);
  }

  loadProducts(): void {
    this.products = this.productService.getProducts();
  }

  stockTotal(p: Product): number {
    return this.productService.totalStock(p);
  }

  onLoginSuccess(): void {
    this.showLoginModal = false;
    if (this.authService.isAdmin) {
      this.productService.reloadFromSupabase().then(() => this.loadProducts());
    } else {
      this.authService.logout().catch(console.error);
      this.showLoginModal = true;
    }
  }

  goToCatalog(): void {
    this.router.navigate(['/']);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/']);
  }

  openAddForm(): void {
    this.editingProduct = null;
    this.formData = {
      name: '',
      description: '',
      price: 0,
      originalPrice: null,
      category: 'tops',
      categoryLabel: this.labelForCategory('tops'),
      colorsInput: '',
      image: '',
      emoji: '🛍️',
      bgColor: '#f0ede0',
      badge: '',
    };
    this.formSizes = [
      { label: 'P', stock: 0 },
      { label: 'M', stock: 0 },
      { label: 'G', stock: 0 },
      { label: 'GG', stock: 0 },
    ];
    this.showProductForm = true;
  }

  openEditForm(product: Product): void {
    this.editingProduct = product;
    this.formData = {
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      category: (product.category ?? 'tops') as CategoryKey,
      categoryLabel: product.categoryLabel ?? this.labelForCategory((product.category ?? 'tops') as CategoryKey),
      colorsInput: (product.colors || []).join(', '),
      image: product.image ?? '',
      emoji: product.emoji ?? '🛍️',
      bgColor: product.bgColor ?? '#f0ede0',
      badge: product.badge ?? '',
    };
    this.formSizes = product.sizes.length
      ? product.sizes.map(s => ({ label: s.label, stock: s.stock }))
      : [{ label: 'Único', stock: 0 }];
    this.showProductForm = true;
  }

  onCategoryChange(): void {
    this.formData.categoryLabel = this.labelForCategory(this.formData.category);
  }

  private labelForCategory(key: CategoryKey): string {
    const found = this.categories.find(c => c.key === key);
    return found?.label ?? key;
  }

  addSizeRow(): void {
    this.formSizes.push({ label: '', stock: 0 });
  }

  removeSizeRow(index: number): void {
    if (this.formSizes.length <= 1) return;
    this.formSizes.splice(index, 1);
  }

  onImageFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    if (file.size > 1_200_000) {
      alert('Arquivo muito grande (máx. ~1,2 MB). Comprima a imagem ou use um link.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { this.formData.image = reader.result as string; };
    reader.readAsDataURL(file);
  }

  clearImage(): void { this.formData.image = ''; }

  closeForm(): void {
    this.showProductForm = false;
    this.editingProduct = null;
    this.formError = '';
  }

  async submitForm(): Promise<void> {
  this.formError = '';
  const colors = this.formData.colorsInput.split(',').map(c => c.trim()).filter(Boolean);
  const sizes: ProductSize[] = this.formSizes
    .map(row => ({ label: row.label.trim(), stock: Math.max(0, Math.floor(Number(row.stock) || 0)) }))
    .filter(row => row.label.length > 0);

  if (!sizes.length) { this.formError = 'Informe ao menos um tamanho com nome.'; return; }

  const parsedPrice = Number(String(this.formData.price).replace(',', '.'));
  const parsedOriginalPrice = this.formData.originalPrice != null
    ? Number(String(this.formData.originalPrice).replace(',', '.'))
    : undefined;

  const payload: Omit<Product, 'id'> & { id?: Product['id'] } = {
    name: this.formData.name.trim(),
    description: this.formData.description.trim() || undefined,
    price: parsedPrice,
    originalPrice: typeof parsedOriginalPrice === 'number' && Number.isFinite(parsedOriginalPrice) && parsedOriginalPrice > 0
      ? parsedOriginalPrice : undefined,
    category: this.formData.category,
    categoryLabel: this.formData.categoryLabel.trim() || this.labelForCategory(this.formData.category),
    badge: this.formData.badge || undefined,
    sizes,
    colors: colors.length ? colors : undefined,
    image: this.formData.image.trim() || undefined,
    emoji: this.formData.emoji.trim() || '🛍️',
    bgColor: this.formData.bgColor.trim() || '#f0ede0',
    whatsappMessage: undefined,
  };

  if (!payload.name || !Number.isFinite(payload.price) || payload.price < 0) {
    this.formError = 'Preencha nome e preço válidos.';
    return;
  }

  try {
    if (this.editingProduct) {
      await this.productService.updateProduct({ ...(payload as Product), id: this.editingProduct.id });
      this.loadProducts();
      this.showToast('Produto atualizado com sucesso!', true);
    } else {
      await this.productService.createProduct(payload as Omit<Product, 'id'>);
      this.loadProducts();
      this.showToast('Produto cadastrado com sucesso!', true);
    }
  } catch (err: unknown) {
    const supaErr = err as { message?: string; code?: string };
    this.formError = supaErr?.message ?? 'Erro ao salvar produto. Tente novamente.';
    console.error(err);
  }
}

private showToast(message: string, closeFormAfter = false): void {
  this.successToastMessage = message;
  this.showSuccessToast = true;
  this.cdr.detectChanges();
  setTimeout(() => {
    this.showSuccessToast = false;
    if (closeFormAfter) this.closeForm();
    this.cdr.detectChanges();
  }, 2000);
}

async toggleHidden(id: string | number): Promise<void> {
  const product = this.products.find(p => String(p.id) === String(id));
  try {
    await this.productService.toggleHidden(id);
    this.loadProducts();
    const isNowHidden = !product?.hidden;
    this.showToast(isNowHidden ? 'Produto removido do catálogo' : 'Produto exibido no catálogo');
  } catch (err: unknown) {
    const e = err as { message?: string };
    alert(`Erro ao ocultar produto: ${e?.message ?? String(err)}`);
    console.error(err);
  }
}

async switchToOrders(filter: OrderStatus | 'todos'): Promise<void> {
  this.adminView = 'pedidos';
  this.orderFilter = filter;
  this.loadingOrders = true;
  this.cdr.detectChanges();
  this.orders = await this.orderService.getAllOrders();
  this.loadingOrders = false;
  this.cdr.detectChanges();
}

get filteredOrders(): Order[] {
  if (this.orderFilter === 'todos') return this.orders;
  return this.orders.filter(o => o.status === this.orderFilter);
}

get pendingOrdersCount(): number {
  return this.orders.filter(o => o.status === 'pendente').length;
}

get orderFilterLabel(): string {
  if (this.orderFilter === 'todos') return 'Todos';
  return ORDER_STATUS_LABELS[this.orderFilter];
}

countByStatus(status: OrderStatus): number {
  return this.orders.filter(o => o.status === status).length;
}

statusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}

nextStatus(status: OrderStatus): OrderStatus | undefined {
  return ORDER_STATUS_NEXT[status];
}

async advanceStatus(order: Order): Promise<void> {
  const next = ORDER_STATUS_NEXT[order.status];
  if (!next) return;
  await this.orderService.updateStatus(order.id, next);
  order.status = next;
  this.showToast(`Pedido marcado como "${ORDER_STATUS_LABELS[next]}"`);
  this.cdr.detectChanges();
}

async cancelOrder(order: Order): Promise<void> {
  if (!confirm('Cancelar este pedido?')) return;
  await this.orderService.updateStatus(order.id, 'cancelado');
  order.status = 'cancelado';
  this.cdr.detectChanges();
}

async deleteProduct(id: string | number): Promise<void> {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    try {
      await this.productService.deleteProduct(id);
      this.loadProducts();
    } catch (err) {
      alert('Erro ao excluir produto.');
      console.error(err);
    }
  }
}
}