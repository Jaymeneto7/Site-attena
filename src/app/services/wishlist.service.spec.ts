import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { WishlistService } from './wishlist.service';
import { SupabaseService } from './supabase.service';
import { AuthService, User } from './auth.service';

function makeSupabaseMock() {
  const eqProductSpy = jasmine.createSpy('eq').and.resolveTo({ error: null });
  const eqUserSpy    = jasmine.createSpy('eq').and.returnValue({ eq: eqProductSpy });
  const deleteSpy    = jasmine.createSpy('delete').and.returnValue({ eq: eqUserSpy });
  const insertSpy    = jasmine.createSpy('insert').and.resolveTo({ error: null });
  const orderSpy     = jasmine.createSpy('order').and.resolveTo({ data: [], error: null });
  const eqSelectSpy  = jasmine.createSpy('eq').and.resolveTo({ data: [], error: null });
  const selectSpy    = jasmine.createSpy('select').and.returnValue({ eq: eqSelectSpy });

  const fromSpy = jasmine.createSpy('from').and.returnValue({
    insert: insertSpy,
    delete: deleteSpy,
    select: selectSpy,
  });

  return {
    client: { from: fromSpy },
    spies: { fromSpy, insertSpy, deleteSpy, selectSpy, eqSelectSpy },
  };
}

function makeAuthMock(user: User | null = null) {
  const subject = new BehaviorSubject<User | null>(user);
  return {
    user$: subject.asObservable(),
    get currentUser() { return subject.getValue(); },
    _subject: subject,
  };
}

describe('WishlistService', () => {
  let service: WishlistService;
  let supabaseMock: ReturnType<typeof makeSupabaseMock>;
  let authMock: ReturnType<typeof makeAuthMock>;

  async function setup(user: User | null = null) {
    localStorage.clear();
    supabaseMock = makeSupabaseMock();
    authMock = makeAuthMock(user);

    TestBed.configureTestingModule({
      providers: [
        WishlistService,
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: AuthService, useValue: authMock },
      ],
    });
    service = TestBed.inject(WishlistService);
    // Aguarda _loadAndMerge / _loadFromLocalStorage assíncrono terminar
    await new Promise(r => setTimeout(r, 0));
  }

  // ── Estado inicial ────────────────────────────────────────────────────────
  describe('estado inicial', () => {
    beforeEach(async () => setup());

    it('has() deve retornar false para qualquer produto', () => {
      expect(service.has('p1')).toBeFalse();
    });

    it('count() deve ser 0', () => {
      expect(service.count()).toBe(0);
    });

    it('getAll() deve retornar array vazio', () => {
      expect(service.getAll()).toEqual([]);
    });
  });

  // ── toggle sem usuário (localStorage) ────────────────────────────────────
  describe('toggle() sem usuário logado', () => {
    beforeEach(async () => setup(null));

    it('deve adicionar produto à wishlist', async () => {
      await service.toggle('p1');
      expect(service.has('p1')).toBeTrue();
    });

    it('deve remover produto já presente', async () => {
      await service.toggle('p1');
      await service.toggle('p1');
      expect(service.has('p1')).toBeFalse();
    });

    it('deve incrementar count ao adicionar', async () => {
      await service.toggle('p1');
      expect(service.count()).toBe(1);
    });

    it('deve decrementar count ao remover', async () => {
      await service.toggle('p1');
      await service.toggle('p1');
      expect(service.count()).toBe(0);
    });

    it('deve salvar no localStorage', async () => {
      await service.toggle('p1');
      const stored = JSON.parse(localStorage.getItem('attena_wishlist') ?? '[]');
      expect(stored).toContain('p1');
    });

    it('deve remover do localStorage ao fazer toggle de item presente', async () => {
      await service.toggle('p1');
      await service.toggle('p1');
      const stored = JSON.parse(localStorage.getItem('attena_wishlist') ?? '[]');
      expect(stored).not.toContain('p1');
    });
  });

  // ── toggle com usuário autenticado (Supabase) ─────────────────────────────
  describe('toggle() com usuário logado', () => {
    const fakeUser: User = { id: 'uid-1', name: 'Teste', email: 'teste@test.com', role: 'cliente' };
    beforeEach(async () => setup(fakeUser));

    it('deve chamar Supabase insert ao adicionar', async () => {
      await service.toggle('p1');
      expect(supabaseMock.spies.insertSpy).toHaveBeenCalled();
    });

    it('deve chamar Supabase delete ao remover', async () => {
      await service.toggle('p1'); // adiciona
      await service.toggle('p1'); // remove
      expect(supabaseMock.spies.deleteSpy).toHaveBeenCalled();
    });

    it('deve fazer atualização otimista — reflete imediatamente no estado local', async () => {
      const togglePromise = service.toggle('p1');
      // Deve ser visível ANTES da Promise resolver
      expect(service.has('p1')).toBeTrue();
      await togglePromise;
    });
  });

  // ── Observable ids$ ───────────────────────────────────────────────────────
  describe('ids$ (observable)', () => {
    beforeEach(async () => setup());

    it('deve emitir novo Set após toggle', async () => {
      const emitted: Set<string>[] = [];
      service.ids$.subscribe(s => emitted.push(s));

      await service.toggle('p1');

      const lastEmit = emitted[emitted.length - 1];
      expect(lastEmit.has('p1')).toBeTrue();
    });
  });
});
