import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, firstValueFrom, from, switchMap, throwError } from 'rxjs';

import { AuthStore } from './auth.store';
import { AuthApiService, PLATAFORMA_AUTH } from './auth-api.service';
import { ToastService } from '@shared/ui';
import { SUPRIMIR_TOAST_NEGOCIO, extractErrorMessage } from '../http/api.util';

/** Rutas [AllowAnonymous]: sin Authorization y sin intento de renovaciÃ³n. */
const ANONYMOUS_URL_FRAGMENTS = [PLATAFORMA_AUTH.login, PLATAFORMA_AUTH.refresh];

/**
 * Resultado de un intento de renovaciÃ³n:
 *  - 'renovada': hay un access token vigente (lo renovamos o alguien mÃ¡s lo hizo);
 *  - 'transitoria': fallo recuperable (red caÃ­da, 429, 5xx) â€” la sesiÃ³n NO se toca;
 *  - 'rechazada': el backend rechazÃ³ el refresh token â€” la sesiÃ³n muriÃ³ de verdad.
 */
type ResultadoRenovacion = 'renovada' | 'transitoria' | 'rechazada';

/** RenovaciÃ³n ÃšNICA en vuelo dentro de la pestaÃ±a (el backend ROTA el refresh en cada uso). */
let renovacionEnVuelo: Promise<ResultadoRenovacion> | null = null;

function renovarSesion(auth: AuthStore, api: AuthApiService): Promise<ResultadoRenovacion> {
  renovacionEnVuelo ??= renovarConCandado(auth, api).finally(() => {
    renovacionEnVuelo = null;
  });
  return renovacionEnVuelo;
}

/** ENTRE pestaÃ±as el single-flight no alcanza: Web Locks serializa la renovaciÃ³n. */
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
  return locks ? locks.request('citas-medicas-refresh', ejecutar) : ejecutar();
}

/** Red caÃ­da / rate limit / servidor: reintentables. Lo demÃ¡s es rechazo real. */
function esFalloTransitorio(error: unknown): boolean {
  return error instanceof HttpErrorResponse
    && (error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500);
}

/**
 * Interceptor de autenticaciÃ³n de la consola:
 *  - aÃ±ade `Authorization: Bearer` con la sesiÃ³n completa o, si no la hay, con el token
 *    de ARRANQUE del enrolamiento MFA (solo lo aceptan las rutas mfa/*),
 *  - RENUEVA la sesiÃ³n sola (proactivo antes de vencer; reactivo ante un 401, una vez),
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

  // Lee el token EN CADA envÃ­o (el reintento tras renovar debe usar el nuevo).
  const enviar = (): Observable<HttpEvent<unknown>> => {
    const token = auth.token() ?? auth.setupToken();
    const request = token && !isAnonymous
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
    return next(request);
  };

  // Idempotente: con N requests fallando a la vez, solo la primera toastea y navega.
  const cerrarSesion = (mensaje = 'Tu sesiÃ³n expirÃ³. Vuelve a iniciar sesiÃ³n.'): void => {
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

  // PROACTIVO: solo con sesiÃ³n completa renovable.
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
        // Sin refresh (p.ej. token de arranque vencido): la sesiÃ³n muriÃ³.
        cerrarSesion(
          auth.setupToken()
            ? 'El enrolamiento venciÃ³. Vuelve a iniciar sesiÃ³n para activar el segundo factor.'
            : undefined,
        );
        return throwError(() => error);
      }

      // REACTIVO: una renovaciÃ³n y UN reintento; si vuelve a fallar, la sesiÃ³n muriÃ³.
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

