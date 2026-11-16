import { Routes } from '@angular/router';
import { CatalogComponent } from '../components/catalog/catalog.component';
import { AdminPanelComponent } from '../components/admin-panel/admin-panel.component';
import { CartComponent } from '../components/cart/cart.component';
import { MinhaContaComponent } from '../components/minha-conta/minha-conta.component';
import { ProductDetailComponent } from '../components/product-detail/product-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: CatalogComponent,
    title: 'site | Catálogo de Produtos'
  },
  {
    path: 'admin',
    component: AdminPanelComponent,
    title: 'site | Painel de Administração'
  },
  {
    path: 'cart',
    component: CartComponent,
    title: 'site | Carrinho'
  },
  {
    path: 'minha-conta',
    component: MinhaContaComponent,
    title: 'site | Minha Conta'
  },
  {
    path: 'produto/:id',
    component: ProductDetailComponent,
    title: 'site | Produto'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];