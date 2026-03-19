import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, HeroComponent, CatalogComponent, FooterComponent],
  template: `
    <app-navbar />
    <app-hero />
    <app-catalog />
    <app-footer />
  `
})
export class AppComponent {}