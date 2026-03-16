// File: src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  /**
   * Mock inicial — agora todos os IDs são string.
   */
  private products: Product[] = [
    {
      id: '1',
      name: 'Legging Essential',
      description: 'Legging de alta compressão com tecnologia anti-suor',
      price: 159.90,
      colors: ['Preto', 'Marrom', 'Verde'],
      sizes: ['P', 'M', 'G', 'GG'],
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400'
    },
    {
      id: '2',
      name: 'Top Power',
      description: 'Top esportivo com suporte médio e design ergonômico',
      price: 89.90,
      colors: ['Azul', 'Vermelho, Bege'],
      sizes: ['P', 'M', 'G'],
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'
    },
    {
      id: '3',
      name: 'Conjunto Athena',
      description: 'Conjunto completo: legging + top de alta performance',
      price: 229.90,
      colors: ['Marrom', 'Verde', 'Azul'],
      sizes: ['P', 'M', 'G', 'GG'],
      image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'
    },
    {
      id: '4',
      name: 'Shorts Fitness',
      description: 'Shorts cintura alta com bolso interno',
      price: 119.90,
      colors: ['Preto', 'Laranja', 'Azul'],
      sizes: ['P', 'M', 'G', 'GG'],
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400'
    }
  ];

  /** Retorna a lista completa (clonada para evitar mutação externa). */
  getProducts(): Product[] {
    return [...this.products];
  }

  /** Busca produto por ID string. */
  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  /** Adiciona um novo produto (ID deve vir como string). */
  addProduct(product: Product): void {
    this.products.push({ ...product });
  }

  /** Atualiza um produto existente. */
  updateProduct(updatedProduct: Product): void {
    const index = this.products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      this.products[index] = { ...updatedProduct };
    }
  }

  /** Remove produto por ID string. */
  deleteProduct(id: string): void {
    this.products = this.products.filter(p => p.id !== id);
  }
}
