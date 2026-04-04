    import { Component, OnInit, OnDestroy } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { Product } from '../../models/product.model';
    import { ProductService } from '../../services/product.service';
    import { ProductCardComponent } from '../product-card/product-card.component';
    import { NavbarComponent } from '../navbar/navbar.component';
    import { HeroComponent } from '../hero/hero.component';
    import { FooterComponent } from '../footer/footer.component';
    import { Subscription } from 'rxjs';

    type FilterKey = 'todos' | 'tops' | 'leggings' | 'shorts' | 'conjuntos' | 'masculino';

    @Component({
      selector: 'app-catalog',
      standalone: true,
      imports: [CommonModule, ProductCardComponent, NavbarComponent, HeroComponent, FooterComponent],
      template: `
        <app-navbar />
        <app-hero />

        <div class="catalog-layout">

          <aside class="catalog-sidebar">
            <div class="sidebar-title">Categorias</div>
            <nav class="sidebar-nav">
              <button
                *ngFor="let f of filters"
                class="sidebar-item"
                [class.active]="activeFilter === f.key"
                (click)="setFilter(f.key)"
              >
                <span>{{ f.label }}</span>
                <span class="sidebar-count">{{ countByFilter(f.key) }}</span>
              </button>
            </nav>
          </aside>

          <section class="catalog-content">
            <div class="content-header">
              <h2>{{ activeLabelText }}</h2>
              <span class="content-count">{{ filteredProducts.length }} produto(s)</span>
            </div>

            <div class="grid">
              <app-product-card
                *ngFor="let p of filteredProducts; trackBy: trackByProductId"
                [product]="p"
              />
            </div>

            <div *ngIf="filteredProducts.length === 0" class="empty">
              Nenhum produto nessa categoria no momento.
            </div>
          </section>

        </div>

        <app-footer />
      `,
      styles: [`
        .catalog-layout {
          display: flex;
          background: #FCFAE5;
          min-height: 60vh;
        }

        /* Sidebar */
        .catalog-sidebar {
          width: 200px;
          min-width: 200px;
          background: #fff;
          border-right: 0.5px solid #d8d5c8;
          padding: 1.5rem 0;
          position: sticky;
          top: 58px;
          height: calc(100vh - 58px);
          overflow-y: auto;
        }

        .sidebar-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #aaa;
          font-weight: 600;
          padding: 0 1rem 0.75rem;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 0.5rem;
        }

        .sidebar-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.6rem 0.75rem;
          border-radius: 8px;
          background: none;
          border: none;
          font-size: 0.875rem;
          color: #555;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s, color 0.15s;
          width: 100%;
        }
        .sidebar-item:hover { background: #f4f4f0; color: #395531; }
        .sidebar-item.active { background: #395531; color: #FCFAE5; font-weight: 600; }
        .sidebar-item.active .sidebar-count { background: rgba(252,250,229,0.25); color: #FCFAE5; }

        .sidebar-count {
          background: #f0ede4;
          color: #888;
          border-radius: 20px;
          padding: 1px 8px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        /* Conteúdo */
        .catalog-content { flex: 1; padding: 1.5rem; }

        .content-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .content-header h2 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #395531;
          font-family: Georgia, serif;
          margin: 0;
        }

        .content-count { font-size: 0.8rem; color: #aaa; }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }

        .empty {
          text-align: center;
          padding: 3rem;
          color: #aaa;
          font-size: 14px;
        }

        @media (max-width: 640px) {
          .catalog-layout { flex-direction: column; }
          .catalog-sidebar {
            width: 100%;
            min-width: unset;
            position: static;
            height: auto;
            border-right: none;
            border-bottom: 0.5px solid #d8d5c8;
            padding: 1rem 0.5rem;
          }
          .sidebar-nav { flex-direction: row; flex-wrap: wrap; }
          .sidebar-item { width: auto; }
        }
      `]
    })
    export class CatalogComponent implements OnInit, OnDestroy {
    allProducts: Product[] = [];
    filteredProducts: Product[] = [];
    activeFilter: FilterKey = 'todos';
    private productsSub?: Subscription;

      filters: { key: FilterKey; label: string }[] = [
        { key: 'todos',     label: 'Todos' },
        { key: 'tops',      label: 'Tops' },
        { key: 'leggings',  label: 'Leggings' },
        { key: 'shorts',    label: 'Shorts' },
        { key: 'conjuntos', label: 'Conjuntos' },
        // { key: 'masculino', label: 'Masculino' },
      ];

      constructor(private productService: ProductService) {}

    ngOnInit() {
      // Carrega imediatamente se já tiver dados
      this.allProducts = this.productService.getProducts().filter(p => !p.hidden);
      this.filteredProducts = this.allProducts;

      // Escuta quando o Supabase terminar de carregar
      this.productService.productsLoaded.subscribe(products => {
        this.allProducts = products
          .filter(p => !p.hidden)
          .map(p => ({ ...p, sizes: p.sizes.map(s => ({ ...s })) }));
        this.filteredProducts = this.activeFilter === 'todos'
          ? this.allProducts
          : this.allProducts.filter(p => p.category === this.activeFilter);
      });
    }

    ngOnDestroy() {
  this.productsSub?.unsubscribe();
}

      setFilter(key: FilterKey) {
        this.activeFilter = key;
        this.filteredProducts = key === 'todos'
          ? this.allProducts
          : this.allProducts.filter(p => p.category === key);
      }

      trackByProductId(index: number, product: Product): number | string {
        return product.id;
      }

      countByFilter(key: FilterKey): number {
        if (key === 'todos') return this.allProducts.length;
        return this.allProducts.filter(p => p.category === key).length;
      }

      get activeLabelText(): string {
        return this.filters.find(f => f.key === this.activeFilter)?.label ?? 'Todos';
      }
    }