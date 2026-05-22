import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

function makeAuthMock(sessionUser: object | null = null) {
  const onAuthStateChangeSpy = jasmine.createSpy('onAuthStateChange');
  const getSessionSpy = jasmine
    .createSpy('getSession')
    .and.resolveTo({ data: { session: sessionUser ? { user: sessionUser } : null } });

  const signInSpy = jasmine.createSpy('signInWithPassword');
  const signUpSpy = jasmine.createSpy('signUp');
  const signOutSpy = jasmine.createSpy('signOut').and.resolveTo({});
  const updateUserSpy = jasmine.createSpy('updateUser');
  const signInOAuthSpy = jasmine.createSpy('signInWithOAuth').and.resolveTo({});

  return {
    client: {
      auth: {
        onAuthStateChange: onAuthStateChangeSpy,
        getSession: getSessionSpy,
        signInWithPassword: signInSpy,
        signUp: signUpSpy,
        signOut: signOutSpy,
        updateUser: updateUserSpy,
        signInWithOAuth: signInOAuthSpy,
      },
    },
    spies: { onAuthStateChangeSpy, getSessionSpy, signInSpy, signUpSpy, signOutSpy, updateUserSpy },
  };
}

const FAKE_CLIENTE = {
  id: 'uid-1',
  email: 'cliente@test.com',
  user_metadata: { role: 'cliente', name: 'Cliente Teste' },
};

const FAKE_ADMIN = {
  id: 'uid-2',
  email: 'admin@test.com',
  user_metadata: { role: 'admin', name: 'Admin Teste' },
};

describe('AuthService', () => {
  let service: AuthService;
  let mock: ReturnType<typeof makeAuthMock>;

  async function setup(sessionUser: object | null = null) {
    mock = makeAuthMock(sessionUser);
    await TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: mock },
      ],
    }).compileComponents();
    service = TestBed.inject(AuthService);
    await new Promise(r => setTimeout(r, 0));
  }

  // ── Estado inicial (sem sessão) ───────────────────────────────────────────
  describe('estado inicial sem sessão', () => {
    beforeEach(async () => setup());

    it('isLogged deve ser false', () => {
      expect(service.isLogged).toBeFalse();
    });

    it('currentUser deve ser null', () => {
      expect(service.currentUser).toBeNull();
    });

    it('isAdmin deve ser false', () => {
      expect(service.isAdmin).toBeFalse();
    });

    it('isAuthenticated() deve retornar false', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  // ── Estado com sessão ativa (cliente) ─────────────────────────────────────
  describe('sessão com usuário cliente', () => {
    beforeEach(async () => setup(FAKE_CLIENTE));

    it('isLogged deve ser true', () => {
      expect(service.isLogged).toBeTrue();
    });

    it('currentUser deve ter role cliente', () => {
      expect(service.currentUser?.role).toBe('cliente');
    });

    it('isAdmin deve ser false para role cliente', () => {
      expect(service.isAdmin).toBeFalse();
    });
  });

  // ── Estado com sessão ativa (admin) ───────────────────────────────────────
  describe('sessão com usuário admin', () => {
    beforeEach(async () => setup(FAKE_ADMIN));

    it('isAdmin deve ser true para role admin', () => {
      expect(service.isAdmin).toBeTrue();
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login()', () => {
    beforeEach(async () => setup());

    it('deve retornar { ok: true } quando Supabase retorna dados válidos', async () => {
      mock.spies.signInSpy.and.resolveTo({ data: { user: FAKE_CLIENTE }, error: null });
      const result = await service.login('cliente@test.com', '123456');
      expect(result.ok).toBeTrue();
    });

    it('deve retornar { ok: false, error } quando Supabase retorna erro', async () => {
      mock.spies.signInSpy.and.resolveTo({ data: {}, error: { message: 'Invalid credentials' } });
      const result = await service.login('errado@test.com', 'errado');
      expect(result.ok).toBeFalse();
      expect(result.error).toBe('E-mail ou senha incorretos.');
    });
  });

  // ── registerCliente ───────────────────────────────────────────────────────
  describe('registerCliente()', () => {
    beforeEach(async () => setup());

    it('deve retornar { ok: true } com dados válidos', async () => {
      mock.spies.signUpSpy.and.resolveTo({ data: { user: FAKE_CLIENTE }, error: null });
      const result = await service.registerCliente('Nome', 'novo@test.com', 'senha123');
      expect(result.ok).toBeTrue();
    });

    it('deve retornar erro específico quando e-mail já está cadastrado', async () => {
      mock.spies.signUpSpy.and.resolveTo({
        data: {},
        error: { message: 'User already registered' },
      });
      const result = await service.registerCliente('Nome', 'existente@test.com', 'senha123');
      expect(result.ok).toBeFalse();
      expect(result.error).toBe('Este e-mail já está cadastrado.');
    });

    it('deve retornar a mensagem original para outros erros', async () => {
      mock.spies.signUpSpy.and.resolveTo({
        data: {},
        error: { message: 'Senha muito fraca' },
      });
      const result = await service.registerCliente('Nome', 'test@test.com', '123');
      expect(result.ok).toBeFalse();
      expect(result.error).toBe('Senha muito fraca');
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout()', () => {
    beforeEach(async () => setup(FAKE_CLIENTE));

    it('deve limpar o usuário atual após logout', async () => {
      await service.logout();
      expect(service.isLogged).toBeFalse();
      expect(service.currentUser).toBeNull();
    });
  });

  // ── loginAdmin ────────────────────────────────────────────────────────────
  describe('loginAdmin()', () => {
    beforeEach(async () => setup());

    it('deve retornar false se usuário não for admin', async () => {
      mock.spies.signInSpy.and.resolveTo({ data: { user: FAKE_CLIENTE }, error: null });
      const result = await service.loginAdmin('cliente@test.com', '123456');
      expect(result).toBeFalse();
    });

    it('deve retornar false se o login falhar', async () => {
      mock.spies.signInSpy.and.resolveTo({ data: {}, error: { message: 'Invalid' } });
      const result = await service.loginAdmin('errado@test.com', 'errado');
      expect(result).toBeFalse();
    });
  });

  // ── updateProfile — validação de não autenticado ──────────────────────────
  describe('updateProfile() sem sessão', () => {
    beforeEach(async () => setup());

    it('deve retornar { ok: false } quando não há usuário logado', async () => {
      const result = await service.updateProfile('Novo Nome', 'novo@test.com');
      expect(result.ok).toBeFalse();
      expect(result.error).toBe('Não autenticado.');
    });
  });
});
