import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AuthStore } from './auth.store';

function jwt(payload: Record<string, unknown>): string {
  const b64 = (s: string) => btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64(JSON.stringify(payload))}.firma`;
}

describe('AuthStore (gate scope=plataforma)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  afterEach(() => localStorage.clear());

  it('una sesión con scope=plataforma autentica y expone el usuario del claim', () => {
    const store = TestBed.inject(AuthStore);
    const exp = Math.floor(Date.now() / 1000) + 900;
    store.setSession({ accessToken: jwt({ scope: 'plataforma', unique_name: 'dueno', exp }), refreshToken: 'r' });

    expect(store.isAuthenticated()).toBe(true);
    expect(store.esPlataforma()).toBe(true);
    expect(store.username()).toBe('dueno');
    expect(localStorage.getItem('saas-admin.session')).toContain('"refreshToken":"r"');
  });

  it('un JWT de empleado (sin scope) NO abre la consola aunque esté en localStorage', () => {
    const store = TestBed.inject(AuthStore);
    const exp = Math.floor(Date.now() / 1000) + 900;
    store.setSession({ accessToken: jwt({ tenant_id: 'x', role: 'Administrador', exp }), refreshToken: 'r' });

    expect(store.isAuthenticated()).toBe(false);
    expect(store.esPlataforma()).toBe(false);
  });

  it('el token de arranque vive solo en memoria y setSession lo descarta', () => {
    const store = TestBed.inject(AuthStore);
    store.setSetupToken('tok-setup', 'dueno');
    expect(store.setupToken()).toBe('tok-setup');
    expect(store.setupUsername()).toBe('dueno');
    expect(localStorage.getItem('saas-admin.session')).toBeNull();

    store.setSession({ accessToken: jwt({ scope: 'plataforma', exp: Math.floor(Date.now() / 1000) + 900 }) });
    expect(store.setupToken()).toBeNull();

    store.logout();
    expect(store.session()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('applyTokens respeta el stale-guard del refresh consumido', () => {
    const store = TestBed.inject(AuthStore);
    const exp = Math.floor(Date.now() / 1000) + 900;
    store.setSession({ accessToken: jwt({ scope: 'plataforma', exp }), refreshToken: 'r1' });

    store.applyTokens({ accessToken: jwt({ scope: 'plataforma', exp: exp + 1 }), refreshToken: 'r2' }, 'r-viejo');
    expect(store.refreshToken()).toBe('r1');

    store.applyTokens({ accessToken: jwt({ scope: 'plataforma', exp: exp + 1 }), refreshToken: 'r2' }, 'r1');
    expect(store.refreshToken()).toBe('r2');
  });
});
