import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private whatsappNumber = '5500000000000'; // Substituir pelo número real

  getProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Top Sculpt',
        category: 'tops',
        categoryLabel: 'Top feminino',
        price: 129,
        badge: 'novo',
        sizes: [
          { label: 'P', available: true },
          { label: 'M', available: true },
          { label: 'G', available: false },
          { label: 'GG', available: true },
        ],
        emoji: '🩱',
        bgColor: '#f0ede0',
        whatsappMessage: 'Olá! Tenho interesse no *Top Sculpt* (R$129). Poderia me ajudar?',
      },
      {
        id: 2,
        name: 'Legging Power',
        category: 'leggings',
        categoryLabel: 'Legging feminina',
        price: 189,
        badge: 'hot',
        sizes: [
          { label: 'P', available: true },
          { label: 'M', available: true },
          { label: 'G', available: true },
          { label: 'GG', available: false },
        ],
        emoji: '🩲',
        bgColor: '#eaf0ea',
        whatsappMessage: 'Olá! Tenho interesse na *Legging Power* (R$189). Poderia me ajudar?',
      },
      {
        id: 3,
        name: 'Dry Fit Masculino',
        category: 'masculino',
        categoryLabel: 'Camiseta masculina',
        price: 89,
        originalPrice: 129,
        badge: 'sale',
        sizes: [
          { label: 'P', available: false },
          { label: 'M', available: true },
          { label: 'G', available: true },
          { label: 'GG', available: true },
        ],
        emoji: '👕',
        bgColor: '#f0ece8',
        whatsappMessage: 'Olá! Tenho interesse na *Camiseta Dry Fit Masculino* (R$89). Poderia me ajudar?',
      },
      {
        id: 4,
        name: 'Conjunto Run',
        category: 'conjuntos',
        categoryLabel: 'Conjunto feminino',
        price: 259,
        badge: 'novo',
        sizes: [
          { label: 'P', available: true },
          { label: 'M', available: false },
          { label: 'G', available: true },
          { label: 'GG', available: false },
        ],
        emoji: '🩳',
        bgColor: '#eaeaf0',
        whatsappMessage: 'Olá! Tenho interesse no *Conjunto Run* (R$259). Poderia me ajudar?',
      },
      {
        id: 5,
        name: 'Shorts Active',
        category: 'shorts',
        categoryLabel: 'Shorts masculino',
        price: 99,
        badge: 'hot',
        sizes: [
          { label: 'P', available: true },
          { label: 'M', available: true },
          { label: 'G', available: false },
          { label: 'GG', available: true },
        ],
        emoji: '🩳',
        bgColor: '#f0eae0',
        whatsappMessage: 'Olá! Tenho interesse no *Shorts Active* (R$99). Poderia me ajudar?',
      },
      {
        id: 6,
        name: 'Top Essential',
        category: 'tops',
        categoryLabel: 'Top feminino',
        price: 99,
        originalPrice: 124,
        badge: 'sale',
        sizes: [
          { label: 'P', available: true },
          { label: 'M', available: true },
          { label: 'G', available: true },
          { label: 'GG', available: true },
        ],
        emoji: '🩱',
        bgColor: '#eaf0f0',
        whatsappMessage: 'Olá! Tenho interesse no *Top Essential* (R$99). Poderia me ajudar?',
      },
    ];
  }

  openWhatsApp(message: string): void {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${this.whatsappNumber}?text=${encoded}`, '_blank');
  }

  openWhatsAppGeneral(): void {
    const message = 'Olá! Visitei o catálogo da Attena e gostaria de fazer um pedido.';
    this.openWhatsApp(message);
  }

  addProduct(product: Product): void {
    const products = this.getProducts();
    products.push(product);
  }

  updateProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) products[index] = product;
  }

  deleteProduct(id: string | number): void {
    // implementar conforme necessário
  }
  
}