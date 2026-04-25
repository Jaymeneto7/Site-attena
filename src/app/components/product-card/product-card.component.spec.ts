/**
 * TESTES DO ProductCardComponent — Fase 3: Componentes
 * =====================================================
 * Conceitos novos aqui:
 *
 *  TestBed.createComponent(Comp)
 *    → cria o componente e seu DOM em memória
 *
 *  fixture.componentInstance
 *    → acessa a instância da classe TypeScript (propriedades, métodos)
 *
 *  fixture.nativeElement
 *    → acessa o DOM real (HTMLElement) — use querySelector aqui
 *
 *  fixture.detectChanges()
 *    → dispara o ciclo de detecção de mudanças (como "renderizar")
 *    → SEMPRE chame depois de mudar dados para o HTML atualizar
 *
 *  By.css('.seletor')
 *    → query do Angular no DOM — retorna DebugElement
 *
 *  debugElement.triggerEventHandler('click', evento)
 *    → simula um clique sem precisar de browser real
 *
 *  spyOn(objeto, 'metodo')
 *    → espiona um método JÁ EXISTENTE (diferente de createSpyObj que cria do zero)
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ProductCardComponent } from './product-card.component';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { StockNotificationService } from '../../services/stock-notification.service';
import { Product } from '../../models/product.model';

// ─── Produto de teste ─────────────────────────────────────────────────────────
const PRODUCT_COM_ESTOQUE: Product = {
  id: '1',
  name: 'Top Sculpt',
  category: 'tops',
  categoryLabel: 'Top',
  price: 129,
  badge: 'novo',
  sizes: [
    { label: 'P', stock: 4 },
    { label: 'M', stock: 8 },
    { label: 'G', stock: 0 },  // sem estoque
  ],
  colors: ['Preto', 'Azul'],
  emoji: '🩱',
  bgColor: '#f0ede0',
};

const PRODUCT_SEM_ESTOQUE: Product = {
  ...PRODUCT_COM_ESTOQUE,
  id: '2',
  sizes: [
    { label: 'P', stock: 0 },
    { label: 'M', stock: 0 },
  ],
};

// ─── Setup ────────────────────────────────────────────────────────────────────
describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;
  let component: ProductCardComponent;
  let cartServiceMock: jasmine.SpyObj<CartService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // jasmine.createSpyObj cria mocks de serviços com os métodos que precisamos
    cartServiceMock = jasmine.createSpyObj('CartService', ['addItem', 'isInCart', 'getItems']);
    routerMock      = jasmine.createSpyObj('Router', ['navigate']);

    // Mocks simples para serviços que não são o foco dos testes
    const wishlistMock = { has: () => false, toggle: () => {} };
    const authMock     = { isLogged: false, currentUser: null };
    const notifMock    = { isSubscribed: () => false, subscribe: () => {}, loadSubscriptions: () => Promise.resolve() };

    // Valor padrão: produto NÃO está no carrinho
    cartServiceMock.isInCart.and.returnValue(false);

    await TestBed.configureTestingModule({
      // Para componentes standalone, importamos o próprio componente
      imports: [ProductCardComponent],
      providers: [
        { provide: CartService,              useValue: cartServiceMock },
        { provide: Router,                   useValue: routerMock },
        { provide: WishlistService,          useValue: wishlistMock },
        { provide: AuthService,              useValue: authMock },
        { provide: StockNotificationService, useValue: notifMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;

    // @Input obrigatório — precisa ser definido antes do detectChanges
    component.product = PRODUCT_COM_ESTOQUE;

    // Dispara a detecção de mudanças → o HTML é renderizado
    fixture.detectChanges();
  });

  // ── Grupo 1: Renderização básica ─────────────────────────────────────────
  describe('renderização', () => {
    it('deve criar o componente', () => {
      // toBeTruthy garante que o componente existe
      expect(component).toBeTruthy();
    });

    it('deve exibir o nome do produto no DOM', () => {
      // nativeElement é o HTML real — use querySelector como num browser
      const nome = fixture.nativeElement.querySelector('.card-name');
      expect(nome?.textContent?.trim()).toBe('Top Sculpt');
    });

    it('deve exibir o badge "novo"', () => {
      const badge = fixture.nativeElement.querySelector('.badge');
      expect(badge).not.toBeNull();           // not.toBeNull: o elemento existe
      expect(badge.textContent.trim()).toBe('Novo');
    });

    it('deve exibir apenas tamanhos com estoque (availableSizes)', () => {
      // O template itera availableSizes (filtrado), não todos os tamanhos.
      // P(4) e M(8) têm estoque; G(0) não aparece → 2 elementos
      const sizes = fixture.nativeElement.querySelectorAll('.size');
      expect(sizes.length).toBe(2); // P, M
    });

    it('deve exibir as tags de cor', () => {
      const tags = fixture.nativeElement.querySelectorAll('.color-tag');
      expect(tags.length).toBe(2); // Preto, Azul
    });

    it('NÃO deve exibir a tarja "Indisponível" para produto em estoque', () => {
      const tarja = fixture.nativeElement.querySelector('.out-of-stock-banner');
      expect(tarja).toBeNull(); // toBeNull: elemento não existe no DOM
    });
  });

  // ── Grupo 2: Produto sem estoque ─────────────────────────────────────────
  describe('produto indisponível', () => {
    beforeEach(() => {
      // Troca o produto por um sem estoque e re-renderiza
      component.product = PRODUCT_SEM_ESTOQUE;
      fixture.detectChanges();
    });

    it('isOutOfStock deve ser true', () => {
      expect(component.isOutOfStock).toBeTrue(); // toBeTrue: exatamente true
    });

    it('deve exibir a tarja "Indisponível"', () => {
      const tarja = fixture.nativeElement.querySelector('.out-of-stock-banner');
      expect(tarja).not.toBeNull();
      expect(tarja.textContent.trim()).toBe('Indisponível');
    });

    it('o botão adicionar deve estar desabilitado', () => {
      const btn = fixture.nativeElement.querySelector('.add-btn');
      // toBeTrue: propriedade disabled é true
      expect(btn.disabled).toBeTrue();
    });
  });

  // ── Grupo 3: Seleção de tamanho ──────────────────────────────────────────
  describe('selectSize', () => {
    it('deve atualizar selectedSize ao clicar num tamanho', () => {
      // By.css busca o elemento pelo seletor CSS e retorna DebugElement
      const sizeEls = fixture.debugElement.queryAll(By.css('.size'));

      // triggerEventHandler simula o evento sem precisar de browser
      sizeEls[0].triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();

      expect(component.selectedSize).toBe('P');
    });

    it('deve mostrar o aviso ao tentar adicionar sem selecionar tamanho', () => {
      component.selectedSize = null; // garante que não há tamanho selecionado
      component.addToCart();
      fixture.detectChanges();

      expect(component.showSizeWarning).toBeTrue();
      const aviso = fixture.nativeElement.querySelector('.size-warning');
      expect(aviso).not.toBeNull();
    });

    it('deve esconder o aviso ao selecionar um tamanho', () => {
      component.addToCart(); // dispara aviso
      component.selectSize('M');
      fixture.detectChanges();

      expect(component.showSizeWarning).toBeFalse(); // toBeFalse: exatamente false
    });
  });

  // ── Grupo 4: Seleção de cor ──────────────────────────────────────────────
  describe('selectColor', () => {
    it('deve selecionar a cor ao clicar', () => {
      component.selectColor('Preto');
      expect(component.selectedColor).toBe('Preto');
    });

    it('deve desselecionar se clicar na mesma cor novamente (toggle)', () => {
      component.selectColor('Azul');
      component.selectColor('Azul'); // clica duas vezes

      expect(component.selectedColor).toBeNull();
    });
  });

  // ── Grupo 5: Adicionar ao carrinho ──────────────────────────────────────
  describe('addToCart', () => {
    it('deve chamar cartService.addItem com os dados corretos', () => {
      component.selectedSize = 'M';
      component.addToCart();

      // toHaveBeenCalledOnceWith: foi chamado exatamente uma vez com esses args
      expect(cartServiceMock.addItem).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          id: '1',
          name: 'Top Sculpt',
          size: 'M',
          price: 129,
        })
      );
    });

    it('deve incluir a cor selecionada ao adicionar', () => {
      component.selectedSize  = 'P';
      component.selectedColor = 'Azul';
      component.addToCart();

      expect(cartServiceMock.addItem).toHaveBeenCalledWith(
        jasmine.objectContaining({ size: 'P', color: 'Azul' })
      );
    });

    it('NÃO deve chamar addItem se produto já estiver no carrinho', () => {
      // Reconfigura o spy para retornar true (já está no carrinho)
      cartServiceMock.isInCart.and.returnValue(true);
      component.selectedSize = 'M';
      component.addToCart();

      expect(cartServiceMock.addItem).not.toHaveBeenCalled();
    });
  });

  // ── Grupo 6: Getters derivados ───────────────────────────────────────────
  describe('getters', () => {
    it('badgeLabel deve retornar "Novo" para badge "novo"', () => {
      expect(component.badgeLabel).toBe('Novo');
    });

    it('badgeLabel deve retornar "Sale" para badge "sale"', () => {
      component.product = { ...PRODUCT_COM_ESTOQUE, badge: 'sale' };
      expect(component.badgeLabel).toBe('Sale');
    });

    it('availableSizes deve retornar apenas tamanhos com estoque > 0', () => {
      // P(4), M(8) têm estoque; G(0) não
      const available = component.availableSizes;
      expect(available.length).toBe(2);
      expect(available.map(s => s.label)).toEqual(['P', 'M']);
    });
  });
});
