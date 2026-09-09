import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, catchError, map, of, timeout } from 'rxjs';

import { SUPRIMIR_TOAST_NEGOCIO, apiUrl, unwrap } from '../http/api.util';
import {
  isdetalleErrorCitaMedica,
  isLoginSuccess,
  type LoginRequest,
  type LoginResult,
  type LoginSuccess,
  type MfaStatus,
  type Perfil,
} from './auth.models';

/** Respuestas normalizadas de las operaciones de MFA. */
export interface MfaSetupResp { exito: boolean; secret?: string; otpauthUri?: string; mensaje?: string; }
export interface MfaEnableResp { exito: boolean; recoveryCodes?: readonly string[]; mensaje?: string; }

/** Rutas de la identidad de PLATAFORMA (consola del dueÃ±o). */
export const PLATAFORMA_AUTH = {
  login: '/api/v1/plataforma/auth/login',
  refresh: '/api/auth/refresh',
  logout: '/api/v1/plataforma/auth/logout',
  me: '/api/v1/plataforma/auth/me',
  mfaStatus: '/api/v1/plataforma/auth/mfa/status',
  mfaSetup: '/api/v1/plataforma/auth/mfa/setup',
  mfaEnable: '/api/v1/plataforma/auth/mfa/enable',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  /**
   * POST /api/v1/plataforma/auth/login [AllowAnonymous]. Devuelve tokens, o
   * `mfaRequired`, o `mfaSetupRequired` (token de arranque), o `detalleErrorCitaMedica`.
   */
  login(body: LoginRequest): Observable<LoginResult> {
    const payload = {
      usuario: body.Username,
      clave: body.Password,
      codigoMfa: body.MfaCode
    };

    const context = new HttpContext().set(SUPRIMIR_TOAST_NEGOCIO, true);

    return this.http
      .post<any>(apiUrl(PLATAFORMA_AUTH.login), payload, { context })
      .pipe(map((response) => {
        const data = unwrap<any>(response);
        const tokenAcceso = data?.tokenAcceso || data?.TokenAcceso;
        const tokenRefresco = data?.tokenRefresco || data?.TokenRefresco;
        const expiraEn = data?.expiraEn || data?.ExpiraEn;

        if (tokenAcceso) {
          return {
            accessToken: tokenAcceso,
            refreshToken: tokenRefresco,
            expiresAt: expiraEn,
            username: body.Username,
            scope: 'plataforma'
          } as LoginSuccess;
        }
        return data as LoginResult;
      }));
  }

  /**
   * POST /api/auth/refresh [AllowAnonymous] â€” renueva el par (conserva el scope).
   * El backend responde los fallos como 200 con detalleErrorCitaMedica: aquÃ­ se convierten en
   * error del stream para que el interceptor cierre la sesiÃ³n.
   */
  refresh(accessToken: string, refreshToken: string): Observable<LoginSuccess> {
    return this.http
      .post<unknown>(apiUrl(PLATAFORMA_AUTH.refresh), {
        AccessToken: accessToken,
        RefreshToken: refreshToken,
      })
      .pipe(
        map((response) => {
          const result = unwrap<LoginResult>(response);
          if (!isLoginSuccess(result)) {
            throw new Error(
              isdetalleErrorCitaMedica(result) ? result.detalleErrorCitaMedica.message : 'No se pudo renovar la sesiÃ³n.',
            );
          }
          return result;
        }),
      );
  }

  /** GET /api/v1/plataforma/auth/me â€” perfil del administrador de la sesiÃ³n. */
  me(): Observable<Perfil> {
    return this.http.get<unknown>(apiUrl(PLATAFORMA_AUTH.me)).pipe(map((r) => unwrap<Perfil>(r)));
  }

  /** GET mfa/status â€” Â¿el administrador ya enrolÃ³ su segundo factor? (vale con token de arranque) */
  mfaStatus(): Observable<MfaStatus> {
    return this.http
      .get<unknown>(apiUrl(PLATAFORMA_AUTH.mfaStatus))
      .pipe(map((r) => unwrap<MfaStatus>(r)));
  }

  /** POST mfa/setup â€” inicia el enrolamiento (secreto + otpauth para el QR). */
  mfaSetup(): Observable<MfaSetupResp> {
    const context = new HttpContext().set(SUPRIMIR_TOAST_NEGOCIO, true);
    return this.http
      .post<unknown>(apiUrl(PLATAFORMA_AUTH.mfaSetup), {}, { context })
      .pipe(
        map((r) => {
          const raw = (r ?? {}) as { detalleErrorCitaMedica?: { message: string }; value?: MfaSetupResp };
          if (raw.detalleErrorCitaMedica) return { exito: false, mensaje: raw.detalleErrorCitaMedica.message };
          return { exito: true, secret: raw.value?.secret, otpauthUri: raw.value?.otpauthUri };
        }),
      );
  }

  /** POST mfa/enable â€” confirma con un cÃ³digo y devuelve los cÃ³digos de recuperaciÃ³n (una vez). */
  mfaEnable(code: string): Observable<MfaEnableResp> {
    const context = new HttpContext().set(SUPRIMIR_TOAST_NEGOCIO, true);
    return this.http
      .post<unknown>(apiUrl(PLATAFORMA_AUTH.mfaEnable), { code }, { context })
      .pipe(
        map((r) => {
          const raw = (r ?? {}) as { detalleErrorCitaMedica?: { message: string }; value?: MfaEnableResp };
          if (raw.detalleErrorCitaMedica) return { exito: false, mensaje: raw.detalleErrorCitaMedica.message };
          return { exito: true, recoveryCodes: raw.value?.recoveryCodes ?? [] };
        }),
      );
  }

  /**
   * POST /api/v1/plataforma/auth/logout â€” cierra la sesiÃ³n EN EL SERVIDOR (lista negra
   * + revocaciÃ³n del refresh). Nunca falla hacia el usuario: la sesiÃ³n local ya se
   * borrÃ³ antes de llamar, por eso el token va explÃ­cito.
   */
  logout(accessToken: string | null, refreshToken: string | null, todosLosDispositivos = false): Observable<void> {
    const context = new HttpContext().set(SUPRIMIR_TOAST_NEGOCIO, true);
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

    return this.http
      .post<unknown>(
        apiUrl(PLATAFORMA_AUTH.logout),
        { refreshToken: refreshToken ?? null, todosLosDispositivos },
        { context, headers },
      )
      .pipe(
        map(() => undefined),
        timeout(8000),
        catchError(() => of(undefined)),
      );
  }
}

