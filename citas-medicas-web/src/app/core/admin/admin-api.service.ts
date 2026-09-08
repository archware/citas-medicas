import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { SUPRIMIR_TOAST_NEGOCIO, apiUrl } from '../http/api.util';
import type {
  Administrador,
  CrearAdministradorRequest,
  OnboardTenantRequest,
  OnboardTenantResponse,
  TenantLifecycleResponse,
  TenantResumen,
} from './admin.models';

/**
 * Cliente de la ADMINISTRACIÓN DE PLATAFORMA. Todas las rutas pasan por la puerta dual
 * del backend (token de plataforma o X-Admin-Key); la consola entra SIEMPRE con el
 * bearer de la sesión (lo pone el interceptor). Los errores llegan como problem+json
 * con `errorCode` (TENANT_*, ADMIN_*); las operaciones con diálogo suprimen el toast
 * para mostrarlos inline.
 */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);

  /** GET /api/v1/admin/tenants — todas las empresas. */
  tenants(): Observable<TenantResumen[]> {
    return this.http
      .get<unknown>(apiUrl('/api/v1/admin/tenants'))
      .pipe(map((r) => (Array.isArray(r) ? (r as TenantResumen[]) : [])));
  }

  /** GET /api/v1/admin/tenants/{ruc} */
  tenant(ruc: string): Observable<TenantResumen> {
    return this.http.get<TenantResumen>(apiUrl(`/api/v1/admin/tenants/${encodeURIComponent(ruc)}`));
  }

  /** POST /api/v1/admin/tenants — alta de empresa (201). El error se muestra inline. */
  onboard(body: OnboardTenantRequest): Observable<OnboardTenantResponse> {
    const context = new HttpContext().set(SUPRIMIR_TOAST_NEGOCIO, true);
    return this.http.post<OnboardTenantResponse>(apiUrl('/api/v1/admin/tenants'), body, { context });
  }

  suspender(ruc: string): Observable<TenantLifecycleResponse> {
    return this.transicion(ruc, 'suspender');
  }

  baja(ruc: string): Observable<TenantLifecycleResponse> {
    return this.transicion(ruc, 'baja');
  }

  reactivar(ruc: string): Observable<TenantLifecycleResponse> {
    return this.transicion(ruc, 'reactivacion');
  }

  /** GET /api/v1/admin/administradores */
  administradores(): Observable<Administrador[]> {
    return this.http
      .get<unknown>(apiUrl('/api/v1/admin/administradores'))
      .pipe(map((r) => (Array.isArray(r) ? (r as Administrador[]) : [])));
  }

  /** POST /api/v1/admin/administradores — nuevo administrador de plataforma (201). */
  crearAdministrador(body: CrearAdministradorRequest): Observable<Administrador> {
    const context = new HttpContext().set(SUPRIMIR_TOAST_NEGOCIO, true);
    return this.http.post<Administrador>(apiUrl('/api/v1/admin/administradores'), body, { context });
  }

  private transicion(ruc: string, accion: 'suspender' | 'baja' | 'reactivacion'): Observable<TenantLifecycleResponse> {
    const context = new HttpContext().set(SUPRIMIR_TOAST_NEGOCIO, true);
    return this.http.post<TenantLifecycleResponse>(
      apiUrl(`/api/v1/admin/tenants/${encodeURIComponent(ruc)}/${accion}`),
      {},
      { context },
    );
  }
}
