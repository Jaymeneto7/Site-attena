import { Routes } from '@angular/router';
import { CatalogComponent } from '../components/catalog/catalog.component';
import { AdminPanelComponent } from '../components/admin-panel/admin-panel.component';

// As rotas são a chave para a navegação na aplicação.
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
    path: '**',
    redirectTo: '',
    pathMatch: 'full' // Redireciona qualquer rota não reconhecida para o catálogo
  }
];