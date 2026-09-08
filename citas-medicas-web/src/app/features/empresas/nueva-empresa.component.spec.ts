import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { ToastService } from '@shared/ui';

import { NuevaEmpresaComponent } from './nueva-empresa.component';

interface Priv {
  form: { patchValue: (valores: Record<string, string>) => void };
  guardar(): void;
  cancelar(): void;
  guardando(): boolean;
  error(): string | null;
}

const DATOS_VALIDOS = {
  ruc: '20512345699',
  razonSocial: ' MODA Y CALZADO SAC ',
  dbName: 'erp_moda',
  adminUsername: ' admin_moda ',
  adminPassword: 'Passw0rd!2026',
};

describe('NuevaEmpresaComponent', () => {
  let http: HttpTestingController;

  const crear = (): Priv =>
    TestBed.createComponent(NuevaEmpresaComponent).componentInstance as unknown as Priv;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaEmpresaComponent],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(ToastService), 'success').mockImplementation(() => undefined);
  });

  afterEach(() => http.verify());

  it('con el formulario inválido NO llama al backend', () => {
    const componente = crear();

    componente.guardar();

    http.expectNone(() => true);
    expect(componente.error()).toContain('Revisa los campos');
  });

  it('si el nombre de la base contiene el RUC, NO llama al backend', () => {
    const componente = crear();
    componente.form.patchValue({ ...DATOS_VALIDOS, dbName: 'erp_20512345699' });

    componente.guardar();

    http.expectNone(() => true);
    expect(componente.error()).toContain('no puede contener el RUC');
  });

  it('alta exitosa: envía el payload exacto, notifica y navega al listado', () => {
    const nav = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    const componente = crear();
    componente.form.patchValue(DATOS_VALIDOS);
    componente.guardar();

    const req = http.expectOne('/api/v1/admin/tenants');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      ruc: '20512345699',
      razonSocial: 'MODA Y CALZADO SAC',
      dbName: 'erp_moda',
      adminUsername: 'admin_moda',
      adminPassword: 'Passw0rd!2026',
    });
    req.flush({ tenantId: 't-1', adminUserId: 'u-1' });

    expect(componente.guardando()).toBe(false);
    expect(nav).toHaveBeenCalledWith('/app/empresas');
  });

  it('cancelar vuelve al listado sin llamar al backend', () => {
    const nav = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    const componente = crear();
    componente.cancelar();

    http.expectNone(() => true);
    expect(nav).toHaveBeenCalledWith('/app/empresas');
  });

  it('doble clic en guardar = un solo onboarding', () => {
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    const componente = crear();
    componente.form.patchValue(DATOS_VALIDOS);
    componente.guardar();
    componente.guardar();

    const req = http.expectOne('/api/v1/admin/tenants');
    req.flush({ tenantId: 't-1', adminUserId: 'u-1' });
  });

  it('un error de negocio se muestra inline y no navega', () => {
    const nav = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    const componente = crear();
    componente.form.patchValue(DATOS_VALIDOS);
    componente.guardar();

    http
      .expectOne('/api/v1/admin/tenants')
      .flush(
        { errorCode: 'TENANT_DB_DUPLICADA', detail: 'Ya existe una base con ese nombre.' },
        { status: 409, statusText: 'Conflict' },
      );

    expect(componente.error()).toContain('TENANT_DB_DUPLICADA');
    expect(componente.guardando()).toBe(false);
    expect(nav).not.toHaveBeenCalled();
  });
});
