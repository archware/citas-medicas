import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router, provideRouter } from '@angular/router';

import { LoginComponent } from './login.component';
import { AuthStore } from '../../../core/auth/auth.store';

interface Priv {
  form: { setValue(v: { username: string; password: string; mfaCode: string }): void };
  submitCredentials(): void;
  submitMfa(): void;
  mfaRequired(): boolean;
  errorMessage(): string | null;
}

/** JWT de pruebas (sin firma válida: el front solo decodifica el payload). */
function jwt(payload: Record<string, unknown>): string {
  const b64 = (s: string) => btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64(JSON.stringify(payload))}.firma`;
}

describe('LoginComponent (consola del dueño)', () => {
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  async function montar(): Promise<Priv> {
    const fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();
    const priv = fixture.componentInstance as unknown as Priv;
    priv.form.setValue({ username: 'dueno', password: 'Secreta-Fuerte-2026!', mfaCode: '' });
    return priv;
  }

  it('con mfaSetupRequired guarda el token de arranque y va a /activar-mfa', async () => {
    const priv = await montar();
    priv.submitCredentials();

    const req = http.expectOne('/api/v1/plataforma/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ Username: 'dueno', Password: 'Secreta-Fuerte-2026!', MfaCode: undefined });
    req.flush({ value: { mfaSetupRequired: true, setupToken: 'tok-setup', username: 'dueno' } });

    const store = TestBed.inject(AuthStore);
    expect(store.setupToken()).toBe('tok-setup');
    expect(store.session()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/activar-mfa');
  });

  it('con mfaRequired pide el código y lo reenvía con usuario y contraseña', async () => {
    const priv = await montar();
    priv.submitCredentials();
    http.expectOne('/api/v1/plataforma/auth/login').flush({ value: { mfaRequired: true } });
    expect(priv.mfaRequired()).toBe(true);

    priv.form.setValue({ username: 'dueno', password: 'Secreta-Fuerte-2026!', mfaCode: '123456' });
    priv.submitMfa();
    const req = http.expectOne('/api/v1/plataforma/auth/login');
    expect(req.request.body).toEqual({ Username: 'dueno', Password: 'Secreta-Fuerte-2026!', MfaCode: '123456' });
    req.flush({ value: { accessToken: jwt({ scope: 'plataforma', exp: Math.floor(Date.now() / 1000) + 900 }), refreshToken: 'r', username: 'dueno', scope: 'plataforma' } });

    const store = TestBed.inject(AuthStore);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.username()).toBe('dueno');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/app');
  });

  it('muestra el detailError del backend (credenciales / bloqueo)', async () => {
    const priv = await montar();
    priv.submitCredentials();
    http.expectOne('/api/v1/plataforma/auth/login').flush({ detailError: { errorCode: '03', message: 'Cuenta bloqueada' } });

    expect(priv.errorMessage()).toBe('Cuenta bloqueada');
    expect(TestBed.inject(AuthStore).session()).toBeNull();
  });
});
