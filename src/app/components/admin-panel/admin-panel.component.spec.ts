import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { AdminPanelComponent } from './admin-panel.component';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { OrderService, Order, ORDER_STATUS_LABELS } from '../../services/order.service';
import { Product } from '../../models/product.model';

const FAKE_ADMIN  = { id: 'uid-admin',  email: 'admin@test.com',   role: 'admin',   name: 'Admin' };
const FAKE_CLIENT = { id: 'uid-client', email: 'client@test.com',  role: 'cliente', name: 'Cliente' };

const PRODUTO_VISIVEL: Product = {
  id: '1',
  name: 'Legging Power',
  category: 'leggings',
  categoryLabel: 'Calça',
  price: 189,
  sizes: [{ label: 'M', stock: 5 }],
  emoji: '🩲',
  bgColor: '#f0ede0',
};

const PRODUTO_OCULTO: Product = {
  ...PRODUTO_VISIVEL,
  id: '2',
  name: 'Produto Oculto',
  hidden: true,
};

const PEDIDO_PENDENTE: Order = {
  id: 'ord-1', user_id: 'uid-1', items: [], total: 100,
  status: 'pendente', created_at: '2024-01-01T00:00:00Z',
};

const PEDIDO_PAGO: Order = {
  id: 'ord-2', user_id: 'uid-1', items: [], total: 200,
  status: 'pago', created_at: '2024-01-01T00:00:00Z',
};

function makeSetup(role: 'admin' | 'cliente' | null = 'admin') {
  const user = role === 'admin' ? FAKE_ADMIN : role === 'cliente' ? FAKE_CLIENT : null;

  const productServiceMock = {
    productsLoaded: new BehaviorSubject<Product[]>([]),
    getProducts:        jasmine.createSpy('getProducts').and.returnValue([PRODUTO_VISIVEL, PRODUTO_OCULTO]),
    reloadFromSupabase: jasmine.createSpy('reloadFromSupabase').and.resolveTo(undefined),
    totalStock:         jasmine.createSpy('totalStock').and.returnValue(5),
    toggleHidden:       jasmine.createSpy('toggleHidden').and.resolveTo(undefined),
    updateProduct:      jasmine.createSpy('updateProduct').and.resolveTo(undefined),
    createProduct:      jasmine.createSpy('createProduct').and.resolveTo(undefined),
    deleteProduct:      jasmine.createSpy('deleteProduct').and.resolveTo(undefined),
  };

  const authServiceMock = {
    user$:    new BehaviorSubject(user).asObservable(),
    isLogged: role !== null,
    isAdmin:  role === 'admin',
    logout:   jasmine.createSpy('logout').and.resolveTo(undefined),
  };

  const orderServiceMock = {
    getAllOrders: jasmine.createSpy('getAllOrders').and.resolveTo([PEDIDO_PENDENTE, PEDIDO_PAGO]),
    updateStatus: jasmine.createSpy('updateStatus').and.resolveTo(undefined),
  };

  const routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);

  return { productServiceMock, authServiceMock, orderServiceMock, routerMock };
}

registerLocaleData(localePt, 'pt-BR');

describe('AdminPanelComponent', () => {
  let fixture:   ComponentFixture<AdminPanelComponent>;
  let component: AdminPanelComponent;
  let productServiceMock: ReturnType<typeof makeSetup>['productServiceMock'];
  let authServiceMock:    ReturnType<typeof makeSetup>['authServiceMock'];
  let orderServiceMock:   ReturnType<typeof makeSetup>['orderServiceMock'];
  let routerMock:         ReturnType<typeof makeSetup>['routerMock'];

  async function setup(role: 'admin' | 'cliente' | null = 'admin') {
    const mocks = makeSetup(role);
    productServiceMock = mocks.productServiceMock;
    authServiceMock    = mocks.authServiceMock;
    orderServiceMock   = mocks.orderServiceMock;
    routerMock         = mocks.routerMock;

    await TestBed.configureTestingModule({
      imports: [AdminPanelComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: AuthService,    useValue: authServiceMock },
        { provide: OrderService,   useValue: orderServiceMock },
        { provide: Router,         useValue: routerMock },
        { provide: LOCALE_ID,      useValue: 'pt-BR' },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(AdminPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  // ── ngOnInit ──────────────────────────────────────────────────────────────
  describe('ngOnInit', () => {
    it('deve ocultar o modal e carregar produtos quando usuário é admin', async () => {
      await setup('admin');
      expect(component.showLoginModal).toBeFalse();
      expect(productServiceMock.reloadFromSupabase).toHaveBeenCalled();
    });

    it('deve exibir o modal de login quando usuário é cliente', async () => {
      await setup('cliente');
      expect(component.showLoginModal).toBeTrue();
    });

    it('deve exibir o modal de login quando não há usuário logado', async () => {
      await setup(null);
      expect(component.showLoginModal).toBeTrue();
    });

    it('deve carregar produtos ao receber emissão de productsLoaded', async () => {
      await setup();
      productServiceMock.getProducts.calls.reset();
      productServiceMock.productsLoaded.next([]);
      expect(productServiceMock.getProducts).toHaveBeenCalled();
    });
  });

  // ── canUsePanel ───────────────────────────────────────────────────────────
  describe('canUsePanel', () => {
    it('deve retornar true para admin logado', async () => {
      await setup('admin');
      expect(component.canUsePanel).toBeTrue();
    });

    it('deve retornar false para usuário não logado', async () => {
      await setup(null);
      expect(component.canUsePanel).toBeFalse();
    });

    it('deve retornar false para cliente (não admin)', async () => {
      await setup('cliente');
      expect(component.canUsePanel).toBeFalse();
    });
  });

  // ── filteredProducts ──────────────────────────────────────────────────────
  describe('filteredProducts', () => {
    beforeEach(async () => setup());

    it('deve retornar apenas produtos visíveis quando activeCategory é "todos"', () => {
      component.activeCategory = 'todos';
      expect(component.filteredProducts).toEqual([PRODUTO_VISIVEL]);
    });

    it('deve retornar apenas produtos ocultos quando activeCategory é "ocultos"', () => {
      component.activeCategory = 'ocultos';
      expect(component.filteredProducts).toEqual([PRODUTO_OCULTO]);
    });

    it('deve filtrar produtos visíveis por categoria específica', () => {
      component.activeCategory = 'leggings';
      expect(component.filteredProducts).toEqual([PRODUTO_VISIVEL]);
    });

    it('deve retornar array vazio para categoria sem produtos visíveis', () => {
      component.activeCategory = 'tops';
      expect(component.filteredProducts).toEqual([]);
    });
  });

  // ── activeCategoryLabel ───────────────────────────────────────────────────
  describe('activeCategoryLabel', () => {
    beforeEach(async () => setup());

    it('deve retornar "Todos os produtos" para "todos"', () => {
      component.activeCategory = 'todos';
      expect(component.activeCategoryLabel).toBe('Todos os produtos');
    });

    it('deve retornar "Produtos ocultos" para "ocultos"', () => {
      component.activeCategory = 'ocultos';
      expect(component.activeCategoryLabel).toBe('Produtos ocultos');
    });

    it('deve retornar o label da categoria para uma categoria específica', () => {
      component.activeCategory = 'leggings';
      expect(component.activeCategoryLabel).toBe('Calça');
    });
  });

  // ── hiddenCount ───────────────────────────────────────────────────────────
  describe('hiddenCount', () => {
    it('deve contar corretamente os produtos ocultos', async () => {
      await setup();
      expect(component.hiddenCount).toBe(1);
    });
  });

  // ── productsByCategory ────────────────────────────────────────────────────
  describe('productsByCategory()', () => {
    beforeEach(async () => setup());

    it('deve retornar produtos visíveis da categoria informada', () => {
      expect(component.productsByCategory('leggings')).toEqual([PRODUTO_VISIVEL]);
    });

    it('não deve retornar produtos ocultos', () => {
      expect(component.productsByCategory('leggings').every(p => !p.hidden)).toBeTrue();
    });
  });

  // ── Formulário: openAddForm ───────────────────────────────────────────────
  describe('openAddForm()', () => {
    beforeEach(async () => setup());

    it('deve abrir o formulário zerado para novo produto', () => {
      component.openAddForm();
      expect(component.showProductForm).toBeTrue();
      expect(component.editingProduct).toBeNull();
      expect(component.formData.name).toBe('');
      expect(component.formData.price).toBe(0);
    });

    it('deve resetar os tamanhos para os 4 padrões', () => {
      component.openAddForm();
      expect(component.formSizes.map(s => s.label)).toEqual(['P', 'M', 'G', 'GG']);
    });
  });

  // ── Formulário: openEditForm ──────────────────────────────────────────────
  describe('openEditForm()', () => {
    beforeEach(async () => setup());

    it('deve preencher o formulário com os dados do produto', () => {
      component.openEditForm(PRODUTO_VISIVEL);
      expect(component.showProductForm).toBeTrue();
      expect(component.editingProduct).toBe(PRODUTO_VISIVEL);
      expect(component.formData.name).toBe('Legging Power');
      expect(component.formData.price).toBe(189);
    });

    it('deve preencher formSizes com os tamanhos do produto', () => {
      component.openEditForm(PRODUTO_VISIVEL);
      expect(component.formSizes.length).toBe(1);
      expect(component.formSizes[0]).toEqual({ label: 'M', stock: 5 });
    });
  });

  // ── Formulário: closeForm ─────────────────────────────────────────────────
  describe('closeForm()', () => {
    beforeEach(async () => setup());

    it('deve fechar o formulário e limpar erros', () => {
      component.showProductForm = true;
      component.formError = 'algum erro';
      component.closeForm();
      expect(component.showProductForm).toBeFalse();
      expect(component.formError).toBe('');
    });
  });

  // ── Formulário: addSizeRow / removeSizeRow ────────────────────────────────
  describe('addSizeRow()', () => {
    beforeEach(async () => setup());

    it('deve adicionar uma linha de tamanho vazia', () => {
      component.openAddForm();
      component.addSizeRow();
      expect(component.formSizes.length).toBe(5);
    });
  });

  describe('removeSizeRow()', () => {
    beforeEach(async () => setup());

    it('deve remover a linha pelo índice', () => {
      component.openAddForm();
      component.removeSizeRow(0);
      expect(component.formSizes.length).toBe(3);
    });

    it('não deve remover se houver apenas 1 linha', () => {
      component.formSizes = [{ label: 'P', stock: 2 }];
      component.removeSizeRow(0);
      expect(component.formSizes.length).toBe(1);
    });
  });

  // ── Formulário: clearImage ────────────────────────────────────────────────
  describe('clearImage()', () => {
    beforeEach(async () => setup());

    it('deve limpar a imagem do formulário', () => {
      component.formData.image = 'data:image/png;base64,abc';
      component.clearImage();
      expect(component.formData.image).toBe('');
    });
  });

  // ── Formulário: onCategoryChange ──────────────────────────────────────────
  describe('onCategoryChange()', () => {
    beforeEach(async () => setup());

    it('deve atualizar categoryLabel ao trocar de categoria', () => {
      component.formData.category = 'leggings';
      component.onCategoryChange();
      expect(component.formData.categoryLabel).toBe('Calça');
    });

    it('deve atualizar para a label correta de outra categoria', () => {
      component.formData.category = 'shorts';
      component.onCategoryChange();
      expect(component.formData.categoryLabel).toBe('Shorts');
    });
  });

  // ── submitForm ────────────────────────────────────────────────────────────
  describe('submitForm()', () => {
    beforeEach(async () => setup());

    it('deve definir formError se não houver tamanhos com nome', async () => {
      component.formSizes = [{ label: '', stock: 5 }];
      await component.submitForm();
      expect(component.formError).toBe('Informe ao menos um tamanho com nome.');
      expect(productServiceMock.createProduct).not.toHaveBeenCalled();
    });

    it('deve definir formError se nome estiver vazio', async () => {
      component.formSizes      = [{ label: 'M', stock: 5 }];
      component.formData.name  = '';
      component.formData.price = 100;
      await component.submitForm();
      expect(component.formError).toBe('Preencha nome e preço válidos.');
    });

    it('deve definir formError se preço for negativo', async () => {
      component.formSizes      = [{ label: 'M', stock: 5 }];
      component.formData.name  = 'Top';
      component.formData.price = -1;
      await component.submitForm();
      expect(component.formError).toBe('Preencha nome e preço válidos.');
    });

    it('deve chamar createProduct para novo produto válido', async () => {
      component.editingProduct = null;
      component.formData.name  = 'Novo Top';
      component.formData.price = 99;
      component.formSizes      = [{ label: 'P', stock: 3 }];
      await component.submitForm();
      expect(productServiceMock.createProduct).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ name: 'Novo Top', price: 99 })
      );
    });

    it('deve chamar updateProduct ao editar produto existente', async () => {
      component.editingProduct = PRODUTO_VISIVEL;
      component.formData.name  = 'Legging Editada';
      component.formData.price = 150;
      component.formSizes      = [{ label: 'M', stock: 2 }];
      await component.submitForm();
      expect(productServiceMock.updateProduct).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ name: 'Legging Editada', price: 150, id: '1' })
      );
    });

    it('deve definir formError quando updateProduct lança exceção', async () => {
      productServiceMock.updateProduct.and.rejectWith({ message: 'Erro do servidor' });
      component.editingProduct = PRODUTO_VISIVEL;
      component.formData.name  = 'Legging';
      component.formData.price = 100;
      component.formSizes      = [{ label: 'M', stock: 1 }];
      await component.submitForm();
      expect(component.formError).toBe('Erro do servidor');
    });
  });

  // ── toggleHidden ──────────────────────────────────────────────────────────
  describe('toggleHidden()', () => {
    beforeEach(async () => setup());

    it('deve chamar productService.toggleHidden com o id correto', async () => {
      await component.toggleHidden('1');
      expect(productServiceMock.toggleHidden).toHaveBeenCalledWith('1');
    });

    it('deve recarregar os produtos após toggleHidden', async () => {
      productServiceMock.getProducts.calls.reset();
      await component.toggleHidden('1');
      expect(productServiceMock.getProducts).toHaveBeenCalled();
    });
  });

  // ── deleteProduct ─────────────────────────────────────────────────────────
  describe('deleteProduct()', () => {
    beforeEach(async () => setup());

    it('deve chamar deleteProduct quando o usuário confirma', async () => {
      spyOn(window, 'confirm').and.returnValue(true);
      await component.deleteProduct('1');
      expect(productServiceMock.deleteProduct).toHaveBeenCalledWith('1');
    });

    it('não deve chamar deleteProduct se o usuário cancelar', async () => {
      spyOn(window, 'confirm').and.returnValue(false);
      await component.deleteProduct('1');
      expect(productServiceMock.deleteProduct).not.toHaveBeenCalled();
    });
  });

  // ── switchToOrders ────────────────────────────────────────────────────────
  describe('switchToOrders()', () => {
    beforeEach(async () => setup());

    it('deve trocar a view para "pedidos" e carregar todos os pedidos', async () => {
      await component.switchToOrders('todos');
      expect(component.adminView).toBe('pedidos');
      expect(component.orders.length).toBe(2);
    });

    it('deve aplicar o filtro passado ao chamar switchToOrders', async () => {
      await component.switchToOrders('pendente');
      expect(component.orderFilter).toBe('pendente');
    });
  });

  // ── filteredOrders ────────────────────────────────────────────────────────
  describe('filteredOrders', () => {
    beforeEach(async () => {
      await setup();
      await component.switchToOrders('todos');
    });

    it('deve retornar todos os pedidos quando filtro é "todos"', () => {
      component.orderFilter = 'todos';
      expect(component.filteredOrders.length).toBe(2);
    });

    it('deve retornar apenas pedidos com o status filtrado', () => {
      component.orderFilter = 'pendente';
      expect(component.filteredOrders.length).toBe(1);
      expect(component.filteredOrders[0].status).toBe('pendente');
    });
  });

  // ── pendingOrdersCount ────────────────────────────────────────────────────
  describe('pendingOrdersCount', () => {
    it('deve contar apenas pedidos com status "pendente"', async () => {
      await setup();
      await component.switchToOrders('todos');
      expect(component.pendingOrdersCount).toBe(1);
    });
  });

  // ── orderFilterLabel ──────────────────────────────────────────────────────
  describe('orderFilterLabel', () => {
    beforeEach(async () => setup());

    it('deve retornar "Todos" quando filtro é "todos"', () => {
      component.orderFilter = 'todos';
      expect(component.orderFilterLabel).toBe('Todos');
    });

    it('deve retornar o label do status quando filtro é um OrderStatus', () => {
      component.orderFilter = 'pago';
      expect(component.orderFilterLabel).toBe(ORDER_STATUS_LABELS['pago']);
    });
  });

  // ── countByStatus / statusLabel / nextStatus ──────────────────────────────
  describe('countByStatus()', () => {
    beforeEach(async () => {
      await setup();
      await component.switchToOrders('todos');
    });

    it('deve contar pedidos com o status informado', () => {
      expect(component.countByStatus('pendente')).toBe(1);
      expect(component.countByStatus('pago')).toBe(1);
      expect(component.countByStatus('entregue')).toBe(0);
    });
  });

  describe('statusLabel()', () => {
    beforeEach(async () => setup());

    it('deve retornar o label correto para cada status', () => {
      expect(component.statusLabel('pendente')).toBe('Aguardando pagamento');
      expect(component.statusLabel('entregue')).toBe('Entregue');
    });
  });

  describe('nextStatus()', () => {
    beforeEach(async () => setup());

    it('deve retornar o próximo status correto', () => {
      expect(component.nextStatus('pendente')).toBe('pago');
      expect(component.nextStatus('pago')).toBe('enviado');
      expect(component.nextStatus('enviado')).toBe('entregue');
    });

    it('deve retornar undefined para status sem próximo (entregue, cancelado)', () => {
      expect(component.nextStatus('entregue')).toBeUndefined();
      expect(component.nextStatus('cancelado')).toBeUndefined();
    });
  });

  // ── advanceStatus ─────────────────────────────────────────────────────────
  describe('advanceStatus()', () => {
    beforeEach(async () => setup());

    it('deve avançar status de pendente para pago', async () => {
      const pedido = { ...PEDIDO_PENDENTE };
      await component.advanceStatus(pedido);
      expect(orderServiceMock.updateStatus).toHaveBeenCalledWith('ord-1', 'pago');
      expect(pedido.status).toBe('pago');
    });

    it('não deve chamar updateStatus para pedido entregue (sem próximo)', async () => {
      const pedido: Order = { ...PEDIDO_PENDENTE, status: 'entregue' };
      await component.advanceStatus(pedido);
      expect(orderServiceMock.updateStatus).not.toHaveBeenCalled();
    });
  });

  // ── cancelOrder ───────────────────────────────────────────────────────────
  describe('cancelOrder()', () => {
    beforeEach(async () => setup());

    it('deve cancelar o pedido quando confirmado', async () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const pedido = { ...PEDIDO_PENDENTE };
      await component.cancelOrder(pedido);
      expect(orderServiceMock.updateStatus).toHaveBeenCalledWith('ord-1', 'cancelado');
      expect(pedido.status).toBe('cancelado');
    });

    it('não deve cancelar o pedido se o usuário negar', async () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const pedido = { ...PEDIDO_PENDENTE };
      await component.cancelOrder(pedido);
      expect(orderServiceMock.updateStatus).not.toHaveBeenCalled();
    });
  });

  // ── onLoginSuccess ────────────────────────────────────────────────────────
  describe('onLoginSuccess()', () => {
    it('deve fechar modal e recarregar produtos para admin', async () => {
      await setup('admin');
      component.showLoginModal = true;
      productServiceMock.reloadFromSupabase.calls.reset();
      component.onLoginSuccess();
      expect(component.showLoginModal).toBeFalse();
      expect(productServiceMock.reloadFromSupabase).toHaveBeenCalled();
    });

    it('deve fazer logout se o usuário logado não for admin', async () => {
      await setup('cliente');
      component.onLoginSuccess();
      expect(authServiceMock.logout).toHaveBeenCalled();
    });
  });

  // ── goToCatalog ───────────────────────────────────────────────────────────
  describe('goToCatalog()', () => {
    beforeEach(async () => setup());

    it('deve navegar para a raiz "/"', () => {
      component.goToCatalog();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout()', () => {
    beforeEach(async () => setup());

    it('deve chamar authService.logout e navegar para "/"', async () => {
      await component.logout();
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
