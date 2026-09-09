import { HttpContextToken, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Marca una request para que el interceptor NO toastee sus errores de negocio
 * (400/409/422/5xx): la pantalla los muestra inline (p.ej. el alert de un
 * diÃ¡logo) y el toast duplicarÃ­a el mismo mensaje.
 */
export const SUPRIMIR_TOAST_NEGOCIO = new HttpContextToken<boolean>(() => false);

/**
 * Construye la URL absoluta de un endpoint del backend.
 * En dev `apiBaseUrl` es '' y las rutas absolutas (`/api/...`) pasan por el proxy.
 */
export function apiUrl(path: string): string {
  const base = environment.apiBaseUrl.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

/**
 * Muchas respuestas del backend vienen envueltas en `SuccessResult` -> `{ value: {...} }`.
 * Este helper devuelve `value` cuando existe, o el cuerpo tal cual en caso contrario.
 */
export function unwrap<T>(body: unknown): T {
  if (body !== null && typeof body === 'object' && 'value' in body) {
    const value = (body as { value: unknown }).value;
    if (value !== undefined && value !== null) {
      return value as T;
    }
  }
  return body as T;
}

/** Estructura problem+json que emite el backend en errores de negocio. */
export interface ProblemDetails {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
  readonly errorCode?: string;
  readonly message?: string;
  readonly codigo?: number | string;
  readonly titulo?: string;
  readonly detalle?: string;
  readonly detalleErrorCitaMedica?: {
    readonly errorCode?: string;
    readonly message?: string;
  };
}

/**
 * Extrae un mensaje legible de un error HTTP (problem+json u otro formato).
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend estÃ© disponible.';
    }
    const body = error.error as ProblemDetails | string | null;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object') {
      const parts: string[] = [];
      const errorObj = (body.detalleErrorCitaMedica as any) ?? body;
      
      if (errorObj.errorCode ?? errorObj.codigo) {
        parts.push(String(errorObj.errorCode ?? errorObj.codigo));
      }
      const detail = errorObj.message ?? errorObj.detail ?? errorObj.title ?? errorObj.detalle ?? errorObj.titulo;
      if (detail) {
        parts.push(String(detail));
      }
      if (parts.length > 0) {
        return parts.join(' - ');
      }
    }
    return `Error ${error.status}${error.statusText ? ` - ${error.statusText}` : ''}`;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'OcurriÃ³ un error inesperado.';
}

/** PÃ¡gina estÃ¡ndar del backend: `{ data, page, pageSize, totalRecords, totalPages }`. */
export interface Paged<T> {
  readonly data: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalRecords: number;
  readonly totalPages: number;
}

/**
 * Normaliza una respuesta de lista a `Paged<T>` tolerando:
 *  - la forma canÃ³nica `{ data, page, ... }`,
 *  - un arreglo plano,
 *  - `{ items: [...] }` u otras variantes con arreglo interno.
 */
export function toPaged<T>(body: unknown, fallbackPage = 1, fallbackPageSize = 10): Paged<T> {
  const source = unwrap<unknown>(body);

  if (Array.isArray(source)) {
    return {
      data: source as T[],
      page: fallbackPage,
      pageSize: fallbackPageSize,
      totalRecords: source.length,
      totalPages: 1,
    };
  }

  if (source && typeof source === 'object') {
    const record = source as Record<string, unknown>;
    const data = (record['data'] ?? record['items'] ?? record['results'] ?? []) as T[];
    const totalRecords = Number(record['totalRecords'] ?? record['total'] ?? data.length);
    const pageSize = Number(record['pageSize'] ?? fallbackPageSize);
    const page = Number(record['page'] ?? fallbackPage);
    const totalPages = Number(
      record['totalPages'] ?? Math.max(1, Math.ceil(totalRecords / Math.max(1, pageSize))),
    );
    return { data: Array.isArray(data) ? data : [], page, pageSize, totalRecords, totalPages };
  }

  return { data: [], page: fallbackPage, pageSize: fallbackPageSize, totalRecords: 0, totalPages: 1 };
}

