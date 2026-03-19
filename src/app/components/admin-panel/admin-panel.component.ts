import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {

  showLoginModal = false;
  showProductForm = false;
  products: Product[] = [];
  editingProduct: Product | null = null;

  formData = {
    name: '',
    description: '',
    price: 0,
    colorsInput: '',
    sizesInput: '',
    image: ''
  };

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const isAuth = typeof this.authService.isAuthenticated === 'function'
      ? this.authService.isAuthenticated()
      : (this.authService as any).isAuthenticated;

    this.showLoginModal = !isAuth;
    this.loadProducts();
  }

  loadProducts(): void {
    this.products = this.productService.getProducts();
  }

  onLoginSuccess(): void {
    this.showLoginModal = false;
    this.loadProducts();
  }

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  logout(): void {
    if (typeof this.authService.logout === 'function') {
      this.authService.logout();
    }
    this.router.navigate(['/']);
  }

  openAddForm(): void {
    this.editingProduct = null;
    this.formData = { name: '', description: '', price: 0, colorsInput: '', sizesInput: '', image: '' };
    this.showProductForm = true;
  }

  openEditForm(product: Product): void {
    this.editingProduct = product;
    this.formData = {
      name: product.name,
      description: product.description ?? '', // ✅ corrigido: era possivelmente undefined
      price: product.price,
      colorsInput: (product.colors || []).join(','),
      sizesInput: (product.sizes || []).join(','),
      image: product.image ?? ''
    };
    this.showProductForm = true;
  }

  closeForm(): void {
    this.showProductForm = false;
    this.editingProduct = null;
  }

  submitForm(): void {
    const colorsArray = this.formData.colorsInput.split(',').map(c => c.trim()).filter(c => c.length > 0);
    const sizesArray = this.formData.sizesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const payload: Product = {
      id: this.editingProduct ? this.editingProduct.id : Date.now().toString(),
      name: this.formData.name,
      description: this.formData.description,
      price: this.formData.price,
      colors: colorsArray,
      sizes: sizesArray,
      image: this.formData.image
    };

    if (this.editingProduct) {
      this.productService.updateProduct(payload);
    } else {
      this.productService.addProduct(payload);
    }

    this.loadProducts();
    this.closeForm();
  }

  deleteProduct(id: string): void {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.productService.deleteProduct(id);
      this.loadProducts();
    }
  }
}