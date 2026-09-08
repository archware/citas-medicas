import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { ToastService } from '@shared/ui';

import { EmpresasComponent } from './empresas.component';
import type { TenantResumen } from '../../core/admin/admin.models';

interface Priv {
  confirmar(empresa: TenantResumen, accion: 'suspender' | 'baja' | 'reactivar'): void;
  ejecutar(): void;
  status(): string;
  errorListado(): string;
  errorDialogo(): string | null;
  confirmacion(): unknown;
}

const MODA: TenantResumen = {
  tenantId: 'a', ruc: '20512345699', razonSocial: 'MODA Y CALZADO SAC', estado: 'Active',
  dbName: 'erp_moda', dbProvider: 'PostgreSQL', createdAtUtc: '2026-08-01T00:00:00Z', deactivatedAtUtc: null, usuarios: 11,
};
const ACME: TenantResumen = {
  tenantId: 'b', ruc: '20512345678', razonSocial: 'ACME DEMO SAC', estado: 'Deactivated',
  dbName: 'erp_acme', dbProvider: 'PostgreSQL', createdAtUtc: '2026-07-01T00:00:00Z', deactivatedAtUtc: '2026-08-19T00:00:00Z', usuarios: 1,
};

describe('EmpresasComponent', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresasComponent],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las empresas con su estado legible', async () => {
    const fixture = TestBed.createComponent(EmpresasComponent);
    http.expectOne('/api/v1/admin/tenants').flush([MODA, ACME]);
    await fixture.whenStable();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('MODA Y CALZADO SAC');
    expect(texto).toContain('ACME DEMO SAC');
    expect(texto).toContain('Activa');
    expect(texto).toContain('De baja');
  });

  it('sin empresas queda en estado vacío con la invitación al alta', async () => {
    const fixture = TestBed.createComponent(EmpresasComponent);
    http.expectOne('/api/v1/admin/tenants').flush([]);
    await fixture.whenStable();

    const priv = fixture.componentInstance as unknown as Priv;
    expect(priv.status()).toBe('empty');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nueva empresa');
  });

  it('si el listado falla, queda en error con el mensaje extraído', async () => {
    const fixture = TestBed.createComponent(EmpresasComponent);
    http
      .expectOne('/api/v1/admin/tenants')
      .flush({ errorCode: 'ADMIN_NO_AUTORIZADO', detail: 'Credencial inválida.' }, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    const priv = fixture.componentInstance as unknown as Priv;
    expect(priv.status()).toBe('error');
    expect(priv.errorListado()).toContain('ADMIN_NO_AUTORIZADO');
  });

  it('suspender pide confirmación, llama al endpoint y recarga', async () => {
    const toast = TestBed.inject(ToastService);
    const success = vi.spyOn(toast, 'success').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(EmpresasComponent);
    http.expectOne('/api/v1/admin/tenants').flush([MODA]);
    await fixture.whenStable();

    const priv = fixture.componentInstance as unknown as Priv;
    priv.confirmar(MODA, 'suspender');
    await fixture.whenStable();
    priv.ejecutar();

    const req = http.expectOne('/api/v1/admin/tenants/20512345699/suspender');
    expect(req.request.method).toBe('POST');
    req.flush({ tenantId: 'a', ruc: MODA.ruc, razonSocial: MODA.razonSocial, estadoAnterior: 'Active', estado: 'Suspended' });

    http.expectOne('/api/v1/admin/tenants').flush([{ ...MODA, estado: 'Suspended' }]);
    await fixture.whenStable();

    expect(success).toHaveBeenCalledWith('MODA Y CALZADO SAC: Activa → Suspendida.');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Suspendida');
  });

  it('dar de baja llama a su endpoint y notifica la transición', async () => {
    const success = vi.spyOn(TestBed.inject(ToastService), 'success').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(EmpresasComponent);
    http.expectOne('/api/v1/admin/tenants').flush([MODA]);
    await fixture.whenStable();

    const priv = fixture.componentInstance as unknown as Priv;
    priv.confirmar(MODA, 'baja');
    await fixture.whenStable();
    priv.ejecutar();

    const req = http.expectOne('/api/v1/admin/tenants/20512345699/baja');
    expect(req.request.method).toBe('POST');
    req.flush({ tenantId: 'a', ruc: MODA.ruc, razonSocial: MODA.razonSocial, estadoAnterior: 'Active', estado: 'Deactivated' });

    http.expectOne('/api/v1/admin/tenants').flush([{ ...MODA, estado: 'Deactivated' }]);
    await fixture.whenStable();

    expect(success).toHaveBeenCalledWith('MODA Y CALZADO SAC: Activa → De baja.');
  });

  it('reactivar usa el endpoint reactivacion', async () => {
    const success = vi.spyOn(TestBed.inject(ToastService), 'success').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(EmpresasComponent);
    http.expectOne('/api/v1/admin/tenants').flush([ACME]);
    await fixture.whenStable();

    const priv = fixture.componentInstance as unknown as Priv;
    priv.confirmar(ACME, 'reactivar');
    await fixture.whenStable();
    priv.ejecutar();

    const req = http.expectOne('/api/v1/admin/tenants/20512345678/reactivacion');
    expect(req.request.method).toBe('POST');
    req.flush({ tenantId: 'b', ruc: ACME.ruc, razonSocial: ACME.razonSocial, estadoAnterior: 'Deactivated', estado: 'Active' });

    http.expectOne('/api/v1/admin/tenants').flush([{ ...ACME, estado: 'Active' }]);
    await fixture.whenStable();

    expect(success).toHaveBeenCalledWith('ACME DEMO SAC: De baja → Activa.');
  });

  it('un error de negocio se queda dentro del diálogo, sin cerrar ni recargar', async () => {
    const success = vi.spyOn(TestBed.inject(ToastService), 'success').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(EmpresasComponent);
    http.expectOne('/api/v1/admin/tenants').flush([ACME]);
    await fixture.whenStable();

    const priv = fixture.componentInstance as unknown as Priv;
    priv.confirmar(ACME, 'reactivar');
    await fixture.whenStable();
    priv.ejecutar();

    http
      .expectOne('/api/v1/admin/tenants/20512345678/reactivacion')
      .flush(
        { errorCode: 'TENANT_DB_NO_DISPONIBLE', detail: 'La base de datos no responde.' },
        { status: 409, statusText: 'Conflict' },
      );
    await fixture.whenStable();

    expect(priv.errorDialogo()).toContain('TENANT_DB_NO_DISPONIBLE');
    expect(priv.confirmacion()).not.toBeNull();
    expect(success).not.toHaveBeenCalled();
    // Sin recarga: el verify() de afterEach fallaría si quedara un GET pendiente.
  });

  it('doble clic en ejecutar = una sola transición', async () => {
    vi.spyOn(TestBed.inject(ToastService), 'success').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(EmpresasComponent);
    http.expectOne('/api/v1/admin/tenants').flush([MODA]);
    await fixture.whenStable();

    const priv = fixture.componentInstance as unknown as Priv;
    priv.confirmar(MODA, 'suspender');
    await fixture.whenStable();
    priv.ejecutar();
    priv.ejecutar();

    const req = http.expectOne('/api/v1/admin/tenants/20512345699/suspender');
    req.flush({ tenantId: 'a', ruc: MODA.ruc, razonSocial: MODA.razonSocial, estadoAnterior: 'Active', estado: 'Suspended' });

    http.expectOne('/api/v1/admin/tenants').flush([{ ...MODA, estado: 'Suspended' }]);
    await fixture.whenStable();
  });
});
