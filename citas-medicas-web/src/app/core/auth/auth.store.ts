import { Injectable, computed, signal } from '@angular/core';
import type { LoginSuccess, Session } from './auth.models';

/** Clave PROPIA de la consola: no pisa la sesiÃ³n del ERP/POS en el mismo navegador. */
const STORAGE_KEY = 'citas-medicas.session';

/** Scope de la sesiÃ³n completa de plataforma (claim `scope` del JWT). */
export const SCOPE_PLATAFORMA = 'plataforma';
/** Scope del token de ARRANQUE (solo enrolar el MFA). */
export const SCOPE_MFA_SETUP = 'plataforma.setup';

interface JwtPayload {
  readonly exp?: number;
  readonly scope?: string;
  readonly unique_name?: string;
  readonly [claim: string]: unknown;
}

/**
 * Fuente Ãºnica de verdad de la sesiÃ³n de la CONSOLA DEL DUEÃ‘O. Custodia la sesiÃ³n
 * completa (scope=plataforma) en una signal reflejada en localStorage, y el token de
 * ARRANQUE del enrolamiento MFA solo en memoria (muere al recargar: se vuelve a
 * iniciar sesiÃ³n, que es lo correcto para un token de un solo propÃ³sito).
 *
 * Defensa en profundidad: un JWT de empleado pegado en localStorage NO abre la
 * consola â€” `isAuthenticated` exige el claim `scope=plataforma`.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _session = signal<Session | null>(this.readFromStorage());
  private readonly _setupToken = signal<string | null>(null);
  private readonly _setupUsername = signal<string>('');

  constructor() {
    if (this.isBrowser()) {
      // Sincroniza la sesiÃ³n ENTRE PESTAÃ‘AS: la rotaciÃ³n del refresh token es de un
      // solo uso; si una pestaÃ±a renueva y otra no se entera, la segunda consumirÃ­a el
      // token viejo y la detecciÃ³n de reuso revocarÃ­a todas las sesiones.
      window.addEventListener('storage', (event) => {
        if (event.key !== STORAGE_KEY) {
          return;
        }
        try {
          this._session.set(event.newValue ? (JSON.parse(event.newValue) as Session) : null);
        } catch {
          this._session.set(null);
        }
      });
    }
  }

  readonly session = this._session.asReadonly();
  readonly token = computed(() => this._session()?.accessToken ?? null);
  readonly refreshToken = computed(() => this._session()?.refreshToken ?? null);

  /** Token de arranque del enrolamiento MFA (solo en memoria). */
  readonly setupToken = this._setupToken.asReadonly();
  readonly setupUsername = this._setupUsername.asReadonly();

  /** Claim `scope` del access token ('' si no hay). */
  readonly scope = computed(() => this.claim('scope') ?? '');
  readonly esPlataforma = computed(() => this.scope() === SCOPE_PLATAFORMA);

  readonly isAuthenticated = computed(() => {
    const session = this._session();
    if (!session?.accessToken || !this.esPlataforma()) {
      return false;
    }
    // Vigente, o vencido pero RENOVABLE: el interceptor lo renueva en la primera
    // llamada; si el refresh token tambiÃ©n muriÃ³, esa llamada cierra la sesiÃ³n.
    return !this.isExpired(session.accessToken) || !!session.refreshToken;
  });

  /** Usuario del administrador (del login, o del claim unique_name del JWT). */
  readonly username = computed(() => this._session()?.username ?? (this.claim('unique_name') ?? ''));

  /** Guarda una sesiÃ³n nueva (tras login completo) y descarta cualquier token de arranque. */
  setSession(login: LoginSuccess, extra?: { username?: string }): void {
    const session: Session = {
      accessToken: login.accessToken,
      refreshToken: login.refreshToken,
      tokenType: login.tokenType,
      username: extra?.username ?? login.username ?? this._session()?.username,
    };
    this._session.set(session);
    this.writeToStorage(session);
    this.clearSetupToken();
  }

  /** Guarda el token de ARRANQUE del enrolamiento MFA (solo memoria). */
  setSetupToken(token: string, username = ''): void {
    this._setupToken.set(token);
    this._setupUsername.set(username);
  }

  clearSetupToken(): void {
    this._setupToken.set(null);
    this._setupUsername.set('');
  }

  /**
   * Aplica el par de tokens ROTADO por /api/auth/refresh conservando el resto de la
   * sesiÃ³n. `refreshTokenUsado` es el stale-guard: si el par vigente ya no es el que
   * esta renovaciÃ³n consumiÃ³ (otra pestaÃ±a lo reemplazÃ³ mientras el POST volaba),
   * aplicar la respuesta revertirÃ­a la sesiÃ³n a un par viejo.
   */
  applyTokens(tokens: LoginSuccess, refreshTokenUsado?: string): void {
    const previous = this._session();
    if (!previous) {
      return;
    }
    if (refreshTokenUsado !== undefined && previous.refreshToken !== refreshTokenUsado) {
      return;
    }
    const session: Session = {
      ...previous,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? previous.refreshToken,
      tokenType: tokens.tokenType ?? previous.tokenType,
    };
    this._session.set(session);
    this.writeToStorage(session);
  }

  /** true si el access token venciÃ³ o vence en < margen (renovar ANTES del 401). */
  tokenPorVencer(margenSegundos = 30): boolean {
    const token = this.token();
    if (!token) {
      return true;
    }
    const payload = this.decode(token);
    if (!payload?.exp) {
      return false;
    }
    return Date.now() >= (payload.exp - margenSegundos) * 1000;
  }

  logout(): void {
    this._session.set(null);
    this.clearSetupToken();
    if (this.isBrowser()) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // ---------------------------------------------------------------------------

  private claim(name: keyof JwtPayload): string | null {
    const token = this.token();
    if (!token) {
      return null;
    }
    const value = this.decode(token)?.[name];
    return typeof value === 'string' ? value : null;
  }

  private isExpired(token: string): boolean {
    const payload = this.decode(token);
    if (!payload?.exp) {
      return false;
    }
    return Date.now() >= payload.exp * 1000;
  }

  private decode(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(normalized)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(''),
      );
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }

  private readFromStorage(): Session | null {
    if (!this.isBrowser()) {
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as Session;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private writeToStorage(session: Session): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}

