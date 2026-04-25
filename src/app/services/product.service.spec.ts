/**
 * TESTES DO ProductService — Fase 2: Mocks
 * =========================================
 * Conceitos novos aqui:
 *
 *  jasmine.createSpyObj('nome', ['metodo1', 'metodo2'])
 *    → cria um objeto falso com métodos que podemos controlar
 *
 *  spy.and.returnValue(valor)
 *    → faz o método retornar um valor fixo quando chamado
 *
 *  spy.and.resolveTo(valor)
 *    → igual ao anterior, mas para Promises (async)
 *
 *  providers: [{ provide: Classe, useValue: mock }]
 *    → diz ao Angular: "quando alguém pedir Classe, dá esse mock"
 *
 *  spy.calls.mostRecent().args
 *    → permite ver com quais argumentos o spy foi chamado
 */

import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { SupabaseService } from './supabase.service';
import { Product } from '../models/product.model';

// ─── Helper: produto mínimo válido ───────────────────────────────────────────
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'uuid-abc-123',
    name: 'Top Sculpt',
    category: 'tops',
    categoryLabel: 'Top',
    price: 129,
    sizes: [
      { label: 'P', stock: 4 },
      { label: 'M', stock: 8 },
      { label: 'G', stock: 0 },
    ],
    emoji: '🩱',
    bgColor: '#f0ede0',
    ...overrides,
  };
}

// ─── Fábrica do mock Supabase ─────────────────────────────────────────────────
//
// O Supabase usa uma "fluent API" em cadeia:
//   client.from('tabela').select('*').order(...)
//
// Para mockar isso, cada método da cadeia precisa retornar
// o próximo objeto da cadeia (ou o resultado final).
//
function makeSupabaseMock(selectResult: { data: unknown[]; error: null | object }) {
  // Cadeia: .select('*').order(...)  →  retorna { data, error }
  const orderSpy   = jasmine.createSpy('order').and.resolveTo(selectResult);
  const selectSpy  = jasmine.createSpy('select').and.returnValue({ order: orderSpy });

  // Cadeia: .insert(...).select().single()  →  simula criação
  const singleSpy  = jasmine.createSpy('single').and.resolveTo({ data: null, error: null });
  const selAfterInsSpy = jasmine.createSpy('select').and.returnValue({ single: singleSpy });
  const insertSpy  = jasmine.createSpy('insert').and.returnValue({ select: selAfterInsSpy });

  // Cadeia: .update(...).eq(...).select().single()
  const singleUpSpy  = jasmine.createSpy('single').and.resolveTo({ data: null, error: null });
  const selUpSpy     = jasmine.createSpy('select').and.returnValue({ single: singleUpSpy });
  const eqUpdateSpy  = jasmine.createSpy('eq').and.returnValue({ select: selUpSpy });
  const updateSpy    = jasmine.createSpy('update').and.returnValue({ eq: eqUpdateSpy });

  // Cadeia: .update({hidden}).eq(...)  (toggleHidden)
  const eqHiddenSpy  = jasmine.createSpy('eq').and.resolveTo({ error: null });
  const updateHiddenSpy = jasmine.createSpy('update').and.returnValue({ eq: eqHiddenSpy });

  // Cadeia: .delete().eq(...)
  const eqDeleteSpy  = jasmine.createSpy('eq').and.resolveTo({ error: null });
  const deleteSpy    = jasmine.createSpy('delete').and.returnValue({ eq: eqDeleteSpy });

  // from() decide qual cadeia devolver por tabela (aqui tudo vai para 'products')
  const fromSpy = jasmine.createSpy('from').and.returnValue({
    select: selectSpy,
    insert: insertSpy,
    update: updateSpy,        // usado em updateProduct e toggleHidden
    delete: deleteSpy,
  });

  return {
    client: { from: fromSpy },
    // Expõe os spies para inspeção nos testes
    spies: { fromSpy, selectSpy, orderSpy, insertSpy, updateSpy, deleteSpy },
  };
}

// ─── Suite principal ──────────────────────────────────────────────────────────
describe('ProductService', () => {
  let service: ProductService;
  let supabaseMock: ReturnType<typeof makeSupabaseMock>;

  beforeEach(async () => {
    // Produto que o Supabase "retornará" quando consultado
    const fakeDbProduct = {
      id: 'uuid-abc-123',
      name: 'Top Sculpt',
      description: null,
      price: 129,
      original_price: null,
      category: 'tops',
      category_label: 'Top',
      badge: null,
      emoji: '🩱',
      bg_color: '#f0ede0',
      image: null,
      colors: null,
      sizes: [{ label: 'P', stock: 4 }, { label: 'M', stock: 8 }, { label: 'G', stock: 0 }],
      whatsapp_message: null,
      hidden: false,
    };

    supabaseMock = makeSupabaseMock({ data: [fakeDbProduct], error: null });

    await TestBed.configureTestingModule({
      providers: [
        ProductService,
        // ↓ Aqui está o mock: quando o Angular pedir SupabaseService,
        //   recebe nosso objeto falso no lugar
        { provide: SupabaseService, useValue: supabaseMock },
      ],
    }).compileComponents();

    service = TestBed.inject(ProductService);

    // Aguarda o init() assíncrono do serviço terminar
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  // ── Grupo 1: cálculos puros (sem mock necessário) ────────────────────────
  describe('totalStock', () => {
    it('deve somar o estoque de todos os tamanhos', () => {
      const product = makeProduct();
      // P=4, M=8, G=0 → total = 12
      expect(service.totalStock(product)).toBe(12);
    });

    it('deve retornar 0 para produto sem estoque', () => {
      const product = makeProduct({
        sizes: [{ label: 'P', stock: 0 }, { label: 'M', stock: 0 }],
      });
      expect(service.totalStock(product)).toBe(0);
    });

    it('deve retornar 0 para produto sem tamanhos', () => {
      const product = makeProduct({ sizes: [] });
      expect(service.totalStock(product)).toBe(0);
    });
  });

  // ── Grupo 2: busca de produto por ID ─────────────────────────────────────
  describe('getProductById', () => {
    it('deve encontrar produto pelo ID', () => {
      const found = service.getProductById('uuid-abc-123');
      expect(found).toBeDefined();        // toBeDefined: não é undefined
      expect(found?.name).toBe('Top Sculpt');
    });

    it('deve retornar undefined para ID inexistente', () => {
      const found = service.getProductById('id-que-nao-existe');
      expect(found).toBeUndefined();      // toBeUndefined: é undefined
    });
  });

  // ── Grupo 3: getProducts retorna cópia (imutabilidade) ───────────────────
  describe('getProducts', () => {
    it('deve retornar os produtos carregados', () => {
      const products = service.getProducts();
      // toBeGreaterThan: maior que
      expect(products.length).toBeGreaterThan(0);
    });

    it('modificar o array retornado NÃO deve afetar o serviço', () => {
      const products = service.getProducts();
      const countBefore = products.length;

      products.push(makeProduct({ id: 'fake', name: 'Invasor' }));

      // O serviço não deve ter sido afetado
      expect(service.getProducts().length).toBe(countBefore);
    });
  });

  // ── Grupo 4: Verificar que o Supabase foi chamado (spy inspection) ───────
  describe('init (carregamento inicial)', () => {
    it('deve consultar a tabela "products" no Supabase ao iniciar', () => {
      // Verifica se from() foi chamado com 'products'
      expect(supabaseMock.spies.fromSpy).toHaveBeenCalledWith('products');
    });

    it('deve ter chamado select("*")', () => {
      // toHaveBeenCalled: verifica se o spy foi invocado pelo menos uma vez
      expect(supabaseMock.spies.selectSpy).toHaveBeenCalled();
    });
  });

  // ── Grupo 5: toggleHidden ────────────────────────────────────────────────
  describe('toggleHidden', () => {
    it('deve inverter o campo hidden do produto', async () => {
      const productBefore = service.getProductById('uuid-abc-123');
      const wasHidden = productBefore?.hidden ?? false; // false inicialmente

      await service.toggleHidden('uuid-abc-123');

      const productAfter = service.getProductById('uuid-abc-123');
      // toEqual: comparação por valor (não por referência)
      expect(productAfter?.hidden).toEqual(!wasHidden);
    });
  });
});
