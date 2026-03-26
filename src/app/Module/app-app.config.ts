import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../guards/auth.guard';

import { CatalogComponent } from '../components/catalog/catalog.component';
import { AdminPanelComponent } from '../components/admin-panel/admin-panel.component';
import { CartComponent } from '../components/cart/cart.component';

export const routes = [
  { path: '', component: CatalogComponent },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent },
  { path: '**', redirectTo: '' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(FormsModule, CommonModule),
    ProductService,
    AuthService
  ]
};