import { TestBed } from '@angular/core/testing';
import { OrderService, OrderStatus } from './order.service';
import { SupabaseService } from './supabase.service';
import { CartItem } from './cart.service';

const FAKE_ITEM: CartItem = {
  id: 'p1', name: 'Legging Power', emoji: '🩲',
  category: 'leggings', price: 189, size: 'M', quantity: 2,
};

function makeSupabaseMock(sessionUser: object | null = null) {
  const getSessionSpy = jasmine
    .createSpy('getSession')
    .and.resolveTo({ data: { session: sessionUser ? { user: sessionUser } : null } });

  const insertSpy = jasmine.createSpy('insert').and.resolveTo({ error: null });

  const orderSpy = jasmine.createSpy('order').and.resolveTo({ data: [], error: null });
  const selectSpy = jasmine.createSpy('select').and.returnValue({ order: orderSpy });

  const eqStatusSpy = jasmine.createSpy('eq').and.resolveTo({ error: null });
  const updateSpy = jasmine.createSpy('update').and.returnValue({ eq: eqStatusSpy });

  const fromSpy = jasmine.createSpy('from').and.returnValue({
    insert: insertSpy,
    select: selectSpy,
    update: updateSpy,
  });

  return {
    client: { auth: { getSession: getSessionSpy }, from: fromSpy },
    spies: { fromSpy, getSessionSpy, insertSpy, selectSpy, orderSpy, updateSpy, eqStatusSpy },
  };
}

describe('OrderService', () => {
  let service: OrderService;
  let mock: ReturnType<typeof makeSupabaseMock>;

  function setup(sessionUser: object | null = null) {
    mock = makeSupabaseMock(sessionUser);
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        { provide: SupabaseService, useValue: mock },
      ],
    });
    service = TestBed.inject(OrderService);
  }

  // ── saveOrder ─────────────────────────────────────────────────────────────
  describe('saveOrder()', () => {
    it('deve inserir pedido com status "pendente"', async () => {
      setup();
      await service.saveOrder([FAKE_ITEM], 378);
      const insertCall = mock.spies.insertSpy.calls.mostRecent().args[0];
      expect(insertCall.status).toBe('pendente');
    });

    it('deve incluir o total correto no insert', async () => {
      setup();
      await service.saveOrder([FAKE_ITEM], 378);
      const insertCall = mock.spies.insertSpy.calls.mostRecent().args[0];
      expect(insertCall.total).toBe(378);
    });

    it('deve incluir os itens no pedido', async () => {
      setup();
      await service.saveOrder([FAKE_ITEM], 378);
      const insertCall = mock.spies.insertSpy.calls.mostRecent().args[0];
      expect(insertCall.items).toEqual([FAKE_ITEM]);
    });

    it('deve usar user_id null para usuário não autenticado', async () => {
      setup(null);
      await service.saveOrder([FAKE_ITEM], 378);
      const insertCall = mock.spies.insertSpy.calls.mostRecent().args[0];
      expect(insertCall.user_id).toBeNull();
    });

    it('deve preencher user_id quando há sessão ativa', async () => {
      setup({ id: 'uid-123', email: 'user@test.com', user_metadata: {} });
      await service.saveOrder([FAKE_ITEM], 378);
      const insertCall = mock.spies.insertSpy.calls.mostRecent().args[0];
      expect(insertCall.user_id).toBe('uid-123');
    });

    it('deve lançar erro quando Supabase retorna erro', async () => {
      setup();
      mock.spies.insertSpy.and.resolveTo({ error: { message: 'DB error' } });
      await expectAsync(service.saveOrder([FAKE_ITEM], 378)).toBeRejected();
    });
  });

  // ── getMyOrders ───────────────────────────────────────────────────────────
  describe('getMyOrders()', () => {
    it('deve retornar array vazio quando não há pedidos', async () => {
      setup();
      const orders = await service.getMyOrders();
      expect(orders).toEqual([]);
    });

    it('deve retornar array vazio quando Supabase retorna erro', async () => {
      setup();
      mock.spies.orderSpy.and.resolveTo({ data: null, error: { message: 'err' } });
      const orders = await service.getMyOrders();
      expect(orders).toEqual([]);
    });

    it('deve consultar a tabela "orders"', async () => {
      setup();
      await service.getMyOrders();
      expect(mock.spies.fromSpy).toHaveBeenCalledWith('orders');
    });
  });

  // ── getAllOrders ──────────────────────────────────────────────────────────
  describe('getAllOrders()', () => {
    it('deve retornar array vazio em caso de erro', async () => {
      setup();
      mock.spies.orderSpy.and.resolveTo({ data: null, error: { message: 'err' } });
      const orders = await service.getAllOrders();
      expect(orders).toEqual([]);
    });

    it('deve retornar os pedidos quando Supabase retorna dados', async () => {
      setup();
      const fakeOrders = [{ id: 'o1', total: 200, status: 'pendente' }];
      mock.spies.orderSpy.and.resolveTo({ data: fakeOrders, error: null });
      const orders = await service.getAllOrders();
      expect(orders.length).toBe(1);
      expect(orders[0].id).toBe('o1');
    });
  });

  // ── updateStatus ──────────────────────────────────────────────────────────
  describe('updateStatus()', () => {
    it('deve chamar update com o status correto', async () => {
      setup();
      await service.updateStatus('order-id-1', 'pago' as OrderStatus);
      expect(mock.spies.updateSpy).toHaveBeenCalledWith({ status: 'pago' });
    });

    it('deve filtrar pelo ID do pedido correto', async () => {
      setup();
      await service.updateStatus('order-id-1', 'enviado' as OrderStatus);
      expect(mock.spies.eqStatusSpy).toHaveBeenCalledWith('id', 'order-id-1');
    });
  });
});
