import { TestBed } from '@angular/core/testing';
import { StockNotificationService } from './stock-notification.service';
import { SupabaseService } from './supabase.service';

function makeSupabaseMock() {
  const eqUserSpy   = jasmine.createSpy('eq').and.resolveTo({ data: [], error: null });
  const selectSpy   = jasmine.createSpy('select').and.returnValue({ eq: eqUserSpy });
  const upsertSpy   = jasmine.createSpy('upsert').and.resolveTo({ error: null });
  const fromSpy     = jasmine.createSpy('from').and.returnValue({
    select: selectSpy,
    upsert: upsertSpy,
  });
  const invokeSpy   = jasmine.createSpy('invoke').and.resolveTo({});

  return {
    client: {
      from: fromSpy,
      functions: { invoke: invokeSpy },
    },
    spies: { fromSpy, selectSpy, eqUserSpy, upsertSpy, invokeSpy },
  };
}

describe('StockNotificationService', () => {
  let service: StockNotificationService;
  let mock: ReturnType<typeof makeSupabaseMock>;

  beforeEach(() => {
    mock = makeSupabaseMock();
    TestBed.configureTestingModule({
      providers: [
        StockNotificationService,
        { provide: SupabaseService, useValue: mock },
      ],
    });
    service = TestBed.inject(StockNotificationService);
  });

  // ── Estado inicial ────────────────────────────────────────────────────────
  describe('estado inicial', () => {
    it('isSubscribed() deve retornar false para qualquer produto', () => {
      expect(service.isSubscribed('p1')).toBeFalse();
    });
  });

  // ── subscribe ─────────────────────────────────────────────────────────────
  describe('subscribe()', () => {
    it('deve registrar produto como inscrito localmente', async () => {
      await service.subscribe('p1', 'uid-1', 'user@test.com');
      expect(service.isSubscribed('p1')).toBeTrue();
    });

    it('deve aceitar id numérico e normalizar para string', async () => {
      await service.subscribe(42, 'uid-1', 'user@test.com');
      expect(service.isSubscribed(42)).toBeTrue();
      expect(service.isSubscribed('42')).toBeTrue();
    });

    it('deve chamar Supabase upsert com os dados corretos', async () => {
      await service.subscribe('p1', 'uid-1', 'user@test.com');
      expect(mock.spies.upsertSpy).toHaveBeenCalledWith(
        { user_id: 'uid-1', product_id: 'p1', email: 'user@test.com' },
        { onConflict: 'user_id,product_id' }
      );
    });

    it('deve salvar na tabela "stock_notifications"', async () => {
      await service.subscribe('p1', 'uid-1', 'user@test.com');
      expect(mock.spies.fromSpy).toHaveBeenCalledWith('stock_notifications');
    });
  });

  // ── loadSubscriptions ─────────────────────────────────────────────────────
  describe('loadSubscriptions()', () => {
    it('deve marcar produtos retornados pelo Supabase como inscritos', async () => {
      mock.spies.eqUserSpy.and.resolveTo({
        data: [{ product_id: 'p10' }, { product_id: 'p20' }],
        error: null,
      });

      await service.loadSubscriptions('uid-1');

      expect(service.isSubscribed('p10')).toBeTrue();
      expect(service.isSubscribed('p20')).toBeTrue();
    });

    it('deve não marcar produtos ausentes como inscritos', async () => {
      mock.spies.eqUserSpy.and.resolveTo({
        data: [{ product_id: 'p10' }],
        error: null,
      });

      await service.loadSubscriptions('uid-1');

      expect(service.isSubscribed('p99')).toBeFalse();
    });

    it('deve lidar com retorno vazio sem erros', async () => {
      mock.spies.eqUserSpy.and.resolveTo({ data: [], error: null });
      await expectAsync(service.loadSubscriptions('uid-1')).toBeResolved();
      expect(service.isSubscribed('p1')).toBeFalse();
    });
  });

  // ── notifySubscribers ─────────────────────────────────────────────────────
  describe('notifySubscribers()', () => {
    it('deve invocar a Edge Function "notify-stock"', async () => {
      await service.notifySubscribers('p1');
      expect(mock.spies.invokeSpy).toHaveBeenCalledWith('notify-stock', {
        body: { product_id: 'p1' },
      });
    });

    it('não deve lançar erro se a Edge Function falhar', async () => {
      mock.spies.invokeSpy.and.rejectWith(new Error('Function unavailable'));
      await expectAsync(service.notifySubscribers('p1')).toBeResolved();
    });
  });
});
