import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, firstValueFrom, from, switchMap, throwError } from 'rxjs';

import { AuthStore } from './auth.store';
import { AuthApiService, PLATAFORMA_AUTH } from './auth-api.service';
import { ToastService } from '@shared/ui';
import { SUPRIMIR_TOAST_NEGOCIO, extractErrorMessage } from '../http/api.util';

/** Rutas [AllowAnonymous]: sin Authorization y sin intento de renovación. */
const ANONYMOUS_URL_FRAGMENTS = [PLATAFORMA_AUTH.login, PLATAFORMA_AUTH.refresh];

/**
 * Resultado de un intento de renovación:
 *  - 'renovada': hay un access token vigente (lo renovamos o alguien más lo hizo);
 *  - 'transitoria': fallo recuperable (red caída, 429, 5xx) — la sesión NO se toca;
 *  - 'rechazada': el backend rechazó el refresh token — la sesión murió de verdad.
 */
type ResultadoRenovacion = 'renovada' | 'transitoria' | 'rechazada';

/** Renovación ÚNICA en vuelo dentro de la pestaña (el backend ROTA el refresh en cada uso). */
let renovacionEnVuelo: Promise<ResultadoRenovacion> | null = null;

function renovarSesion(auth: AuthStore, api: AuthApiService): Promise<ResultadoRenovacion> {
  renovacionEnVuelo ??= renovarConCandado(auth, api).finally(() => {
    renovacionEnVuelo = null;
  });
  return renovacionEnVuelo;
}

/** ENTRE pestañas el single-flight no alcanza: Web Locks serializa la renovación. */
async function renovarConCandado(auth: AuthStore, api: AuthApiService): Promise<ResultadoRenovacion> {
  const ejecutar = async (): Promise<ResultadoRenovacion> => {
    if (!auth.tokenPorVencer()) {
      return 'renovada';
    }
    const accessToken = auth.token();
    const refreshToken = auth.refreshToken();
    if (!accessToken || !refreshToken) {
      return 'rechazada';
    }
    try {
      const tokens = await firstValueFrom(api.refresh(accessToken, refreshToken));
      auth.applyTokens(tokens, refreshToken);
      return 'renovada';
    } catch (error) {
      return esFalloTransitorio(error) ? 'transitoria' : 'rechazada';
    }
  };

  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  return locks ? locks.request('saas-admin-refresh', ejecutar) : ejecutar();
}

/** Red caída / rate limit / servidor: reintentables. Lo demás es rechazo real. */
function esFalloTransitorio(error: unknown): boolean {
  return error instanceof HttpErrorResponse
    && (error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500);
}

/**
 * Interceptor de autenticación de la consola:
 *  - añade `Authorization: Bearer` con la sesión completa o, si no la hay, con el token
 *    de ARRANQUE del enrolamiento MFA (solo lo aceptan las rutas mfa/*),
 *  - RENUEVA la sesión sola (proactivo antes de vencer; reactivo ante un 401, una vez),
 *  - ante errores de negocio (400/409/422/5xx) muestra el problem+json al usuario salvo
 *    que la request lo suprima con SUPRIMIR_TOAST_NEGOCIO.
 * Siempre reemite el error para que la pantalla pueda reaccionar.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const api = inject(AuthApiService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const isAnonymous = ANONYMOUS_URL_FRAGMENTS.some((fragment) => req.url.includes(fragment));

  // Lee el token EN CADA envío (el reintento tras renovar debe usar el nuevo).
  const enviar = (): Observable<HttpEvent<unknown>> => {
    const token = auth.token() ?? auth.setupToken();
    const request = token && !isAnonymous
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
    return next(request);
  };

  // Idempotente: con N requests fallando a la vez, solo la primera toastea y navega.
  const cerrarSesion = (mensaje = 'Tu sesión expiró. Vuelve a iniciar sesión.'): void => {
    if (!auth.session() && !auth.setupToken()) {
      return;
    }
    auth.logout();
    toast.error(mensaje);
    void router.navigate(['/login']);
  };

  const avisarNegocio = (error: HttpErrorResponse): void => {
    if (req.context.get(SUPRIMIR_TOAST_NEGOCIO)) {
      return;
    }
    if (error.status === 409 || error.status === 422 || error.status === 400 || error.status >= 500) {
      if (!isAnonymous) {
        toast.error(extractErrorMessage(error));
      }
    } else if (error.status === 0) {
      toast.error(extractErrorMessage(error));
    }
  };

  // PROACTIVO: solo con sesión completa renovable.
  const inicio$ =
    !isAnonymous && auth.token() && auth.tokenPorVencer() && auth.refreshToken()
      ? from(renovarSesion(auth, api)).pipe(switchMap(() => enviar()))
      : enviar();

  return inicio$.pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        avisarNegocio(error);
        return throwError(() => error);
      }

      if (isAnonymous || !auth.refreshToken()) {
        // Sin refresh (p.ej. token de arranque vencido): la sesión murió.
        cerrarSesion(
          auth.setupToken()
            ? 'El enrolamiento venció. Vuelve a iniciar sesión para activar el segundo factor.'
            : undefined,
        );
        return throwError(() => error);
      }

      // REACTIVO: una renovación y UN reintento; si vuelve a fallar, la sesión murió.
      return from(renovarSesion(auth, api)).pipe(
        switchMap((resultado) => {
          if (resultado === 'rechazada') {
            cerrarSesion();
            return throwError(() => error);
          }
          if (resultado === 'transitoria') {
            return throwError(() => error);
          }
          return enviar().pipe(
            catchError((reintento: HttpErrorResponse) => {
              if (reintento.status === 401) {
                cerrarSesion();
              } else {
                avisarNegocio(reintento);
              }
              return throwError(() => reintento);
            }),
          );
        }),
      );
    }),
  );
};
