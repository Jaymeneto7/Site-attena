import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Inclui diretivas básicas

import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../guards/auth.guard';

// Importa componentes que estarão nas rotas (ajuste os caminhos se necessário)
import { CatalogComponent } from '../components/catalog/catalog.component';
import { AdminPanelComponent } from '../components/admin-panel/admin-panel.component';

// Definição das Rotas (Routes)
export const routes = [
  { path: '', component: CatalogComponent },
  { 
    path: 'admin', 
    component: AdminPanelComponent, 
    canActivate: [AuthGuard] // Aplica o AuthGuard
  },
  // Certifique-se de que App é o nome correto do seu componente principal
  { path: '**', redirectTo: '' } 
];

export const appConfig: ApplicationConfig = {
  providers: [
    // Habilita o sistema de roteamento com as rotas definidas acima
    provideRouter(routes),
    
    // Importa módulos necessários para componentes Standalone
    importProvidersFrom(FormsModule, CommonModule), 
    
    // Fornece seus serviços
    ProductService,
    AuthService
  ]
};