import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { HeroComponent } from '../hero/hero.component';
import { FooterComponent } from '../footer/footer.component';

type FilterKey = 'todos' | 'tops' | 'leggings' | 'shorts' | 'conjuntos' | 'masculino';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, NavbarComponent, HeroComponent, FooterComponent],
  template: `
    <app-navbar />
    <app-hero />

    <section class="catalog">
      <div class="filters">
        <span class="filter-label">Categoria</span>
        <button
          *ngFor="let f of filters"
          class="pill"
          [class.active]="activeFilter === f.key"
          (click)="setFilter(f.key)"
        >{{ f.label }}</button>
      </div>

      <div class="grid">
        <app-product-card
          *ngFor="let p of filteredProducts"
          [product]="p"
        />
      </div>

      <div *ngIf="filteredProducts.length === 0" class="empty">
        Nenhum produto nessa categoria no momento.
      </div>
    </section>

    <app-footer />
  `,
  styles: [`
    .catalog { background: #FCFAE5; padding-bottom: 2rem; }

    .filters {
      padding: 1.5rem 1.5rem 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #aaa;
      margin-right: 4px;
    }

    .pill {
      padding: 7px 18px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid #c8c5b8;
      background: transparent;
      color: #395531;
      transition: all 0.15s;
    }
    .pill:hover { border-color: #395531; }
    .pill.active {
      background: #395531;
      color: #FCFAE5;
      border-color: #395531;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 14px;
      padding: 0.5rem 1.5rem 1rem;
    }

    .empty {
      text-align: center;
      padding: 3rem;
      color: #aaa;
      font-size: 14px;
    }
  `]
})
export class CatalogComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  activeFilter: FilterKey = 'todos';

  filters: { key: FilterKey; label: string }[] = [
    { key: 'todos',     label: 'Todos' },
    { key: 'tops',      label: 'Tops' },
    { key: 'leggings',  label: 'Leggings' },
    { key: 'shorts',    label: 'Shorts' },
    { key: 'conjuntos', label: 'Conjuntos' },
    //{ key: 'masculino', label: 'Masculino' },
  ];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.allProducts = this.productService.getProducts();
    this.filteredProducts = this.allProducts;
  }

  setFilter(key: FilterKey) {
    this.activeFilter = key;
    this.filteredProducts = key === 'todos'
      ? this.allProducts
      : this.allProducts.filter(p => p.category === key);
  }
}