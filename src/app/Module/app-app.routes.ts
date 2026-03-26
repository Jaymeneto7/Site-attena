import { Routes } from '@angular/router';
import { CatalogComponent } from '../components/catalog/catalog.component';
import { AdminPanelComponent } from '../components/admin-panel/admin-panel.component';
import { CartComponent } from '../components/cart/cart.component';

export const routes: Routes = [
  {
    path: '',
    component: CatalogComponent,
    title: 'ATTENA | Catálogo de Produtos'
  },
  {
    path: 'admin',
    component: AdminPanelComponent,
    title: 'ATTENA | Painel de Administração'
  },
  {
    path: 'cart',
    component: CartComponent,
    title: 'ATTENA | Carrinho'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];