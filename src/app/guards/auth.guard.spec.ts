import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let authMock: { isLogged: boolean };
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  function setup(isLogged: boolean) {
    authMock = { isLogged };
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerSpy },
      ],
    });
  }

  describe('usuário autenticado', () => {
    beforeEach(() => setup(true));

    it('deve retornar true e permitir acesso', () => {
      const result = TestBed.runInInjectionContext(() =>
        AuthGuard(dummyRoute, dummyState)
      );
      expect(result).toBeTrue();
    });

    it('não deve redirecionar', () => {
      TestBed.runInInjectionContext(() => AuthGuard(dummyRoute, dummyState));
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('usuário não autenticado', () => {
    beforeEach(() => setup(false));

    it('deve retornar false e bloquear o acesso', () => {
      const result = TestBed.runInInjectionContext(() =>
        AuthGuard(dummyRoute, dummyState)
      );
      expect(result).toBeFalse();
    });

    it('deve redirecionar para a página inicial "/"', () => {
      TestBed.runInInjectionContext(() => AuthGuard(dummyRoute, dummyState));
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
