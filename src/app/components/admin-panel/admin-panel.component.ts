import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Product, ProductSize } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { LoginModalComponent } from '../login-modal/login-modal.component';

type CategoryKey = NonNullable<Product['category']>;

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, LoginModalComponent],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {

  showLoginModal = false;
  showProductForm = false;
  activeCategory = 'todos';
  products: Product[] = [];
  editingProduct: Product | null = null;

  readonly categories: { key: CategoryKey; label: string }[] = [
    { key: 'tops', label: 'Tops / Top feminino' },
    { key: 'leggings', label: 'Leggings' },
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
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLogged || !this.authService.isAdmin) {
      if (this.authService.isLogged && !this.authService.isAdmin) {
        this.authService.logout();
      }
      this.showLoginModal = true;
    } else {
      this.loadProducts();
    }
  }

  get canUsePanel(): boolean {
    return this.authService.isLogged && this.authService.isAdmin;
  }

  get filteredProducts(): Product[] {
    if (this.activeCategory === 'todos') return this.products;
    return this.products.filter(p => p.category === this.activeCategory);
  }

  get activeCategoryLabel(): string {
    if (this.activeCategory === 'todos') return 'Todos os produtos';
    return this.categories.find(c => c.key === this.activeCategory)?.label ?? this.activeCategory;
  }

  productsByCategory(key: CategoryKey): Product[] {
    return this.products.filter(p => p.category === key);
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
      this.loadProducts();
    } else {
      this.authService.logout();
      this.showLoginModal = true;
    }
  }

  goToCatalog(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
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
  }

  submitForm(): void {
    const colors = this.formData.colorsInput.split(',').map(c => c.trim()).filter(Boolean);
    const sizes: ProductSize[] = this.formSizes
      .map(row => ({ label: row.label.trim(), stock: Math.max(0, Math.floor(Number(row.stock) || 0)) }))
      .filter(row => row.label.length > 0);

    if (!sizes.length) { alert('Informe ao menos um tamanho com nome.'); return; }

    const payload: Omit<Product, 'id'> & { id?: Product['id'] } = {
      name: this.formData.name.trim(),
      description: this.formData.description.trim() || undefined,
      price: Number(this.formData.price),
      originalPrice: this.formData.originalPrice != null && this.formData.originalPrice > 0
        ? Number(this.formData.originalPrice) : undefined,
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

    if (!payload.name || payload.price < 0) { alert('Preencha nome e preço válidos.'); return; }

    if (this.editingProduct) {
      this.productService.updateProduct({ ...(payload as Product), id: this.editingProduct.id });
    } else {
      this.productService.createProduct(payload as Omit<Product, 'id'>);
    }

    this.loadProducts();
    this.closeForm();
  }

  deleteProduct(id: string | number): void {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.productService.deleteProduct(id);
      this.loadProducts();
    }
  }
}