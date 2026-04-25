/**
 * TESTES DO CartService
 * =====================
 * Estrutura básica de um teste em Jasmine:
 *
 *   describe('Nome do grupo', () => {    ← agrupa testes relacionados
 *     beforeEach(() => { ... });          ← roda ANTES de cada teste
 *     it('deve fazer X', () => {         ← um teste individual
 *       expect(valor).toBe(esperado);    ← a verificação
 *     });
 *   });
 */

import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from './cart.service';

// Produto fictício reutilizado nos testes
const ITEM_A: CartItem = {
  id: '1', name: 'Legging Power', emoji: '🩲',
  category: 'leggings', price: 189, size: 'M', color: 'Preto',
};

const ITEM_B: CartItem = {
  id: '2', name: 'Top Sculpt', emoji: '🩱',
  category: 'tops', price: 129, size: 'P',
};

describe('CartService', () => {
  let service: CartService;

  // Antes de cada teste: cria uma instância limpa do serviço
  beforeEach(() => {
    localStorage.clear(); // garante sacola vazia entre testes
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  // ── Grupo 1: adicionar itens ──────────────────────────────────────────────
  describe('addItem', () => {
    it('deve adicionar um item à sacola', () => {
      service.addItem(ITEM_A);

      // expect(valor).toBe(esperado) — igualdade estrita
      expect(service.getItems().length).toBe(1);
    });

    it('deve incrementar quantity se o mesmo item (id + tamanho + cor) for adicionado', () => {
      service.addItem(ITEM_A);
      service.addItem(ITEM_A); // mesmo id, size e color

      const items = service.getItems();
      expect(items.length).toBe(1);           // ainda 1 linha
      expect(items[0].quantity).toBe(2);      // mas quantidade = 2
    });

    it('deve tratar como itens distintos se o tamanho for diferente', () => {
      service.addItem({ ...ITEM_A, size: 'M' });
      service.addItem({ ...ITEM_A, size: 'G' }); // mesmo produto, tamanho diferente

      expect(service.getItems().length).toBe(2);
    });

    it('deve tratar como itens distintos se a cor for diferente', () => {
      service.addItem({ ...ITEM_A, color: 'Preto' });
      service.addItem({ ...ITEM_A, color: 'Azul' });

      expect(service.getItems().length).toBe(2);
    });
  });

  // ── Grupo 2: remover itens ───────────────────────────────────────────────
  describe('removeItem', () => {
    it('deve remover o item correto', () => {
      service.addItem(ITEM_A);
      service.addItem(ITEM_B);

      service.removeItem(ITEM_A.id, ITEM_A.size, ITEM_A.color);

      const items = service.getItems();
      expect(items.length).toBe(1);
      expect(items[0].id).toBe('2'); // só ITEM_B permanece
    });

    it('não deve alterar a sacola se o item não existir', () => {
      service.addItem(ITEM_A);
      service.removeItem('999'); // id inexistente

      expect(service.getItems().length).toBe(1);
    });
  });

  // ── Grupo 3: atualizar quantidade ────────────────────────────────────────
  describe('updateQuantity', () => {
    it('deve atualizar a quantidade do item', () => {
      service.addItem(ITEM_A);
      service.updateQuantity(ITEM_A.id, 5, ITEM_A.size, ITEM_A.color);

      expect(service.getItems()[0].quantity).toBe(5);
    });

    it('deve remover o item se a quantidade for 0', () => {
      service.addItem(ITEM_A);
      service.updateQuantity(ITEM_A.id, 0, ITEM_A.size, ITEM_A.color);

      expect(service.getItems().length).toBe(0);
    });
  });

  // ── Grupo 4: cálculo de total ────────────────────────────────────────────
  describe('getTotalPrice', () => {
    it('deve retornar 0 para sacola vazia', () => {
      expect(service.getTotalPrice()).toBe(0);
    });

    it('deve somar preço × quantidade de todos os itens', () => {
      service.addItem({ ...ITEM_A, quantity: 2 }); // 189 × 2 = 378
      service.addItem({ ...ITEM_B, quantity: 1 }); // 129 × 1 = 129

      expect(service.getTotalPrice()).toBe(507);
    });
  });

  // ── Grupo 5: limpar sacola ───────────────────────────────────────────────
  describe('clearCart', () => {
    it('deve esvaziar a sacola completamente', () => {
      service.addItem(ITEM_A);
      service.addItem(ITEM_B);

      service.clearCart();

      expect(service.getItems().length).toBe(0);
      expect(service.getTotalPrice()).toBe(0);
    });
  });

  // ── Grupo 6: verificar se está na sacola ────────────────────────────────
  describe('isInCart', () => {
    it('deve retornar true para item presente', () => {
      service.addItem(ITEM_A);

      // toBeTruthy = qualquer valor "verdadeiro"
      expect(service.isInCart(ITEM_A.id, ITEM_A.size, ITEM_A.color)).toBeTruthy();
    });

    it('deve retornar false para item ausente', () => {
      // toBeFalsy = qualquer valor "falso"
      expect(service.isInCart('999')).toBeFalsy();
    });

    it('deve retornar false se o tamanho for diferente', () => {
      service.addItem({ ...ITEM_A, size: 'M' });

      expect(service.isInCart(ITEM_A.id, 'GG')).toBeFalsy();
    });
  });
});
