/** Contratos de la administración de plataforma (api/v1/admin/*). */

export type TenantEstado = 'Provisioning' | 'Active' | 'Suspended' | 'Deactivated';

/** GET /api/v1/admin/tenants — resumen de una empresa (cualquier estado). */
export interface TenantResumen {
  tenantId: string;
  ruc: string;
  razonSocial: string;
  estado: TenantEstado | string;
  dbName: string;
  dbProvider: string;
  createdAtUtc: string;
  deactivatedAtUtc?: string | null;
  usuarios: number;
}

/** POST /api/v1/admin/tenants — alta de empresa + usuario administrador. */
export interface OnboardTenantRequest {
  ruc: string;
  razonSocial: string;
  dbName: string;
  adminUsername: string;
  adminPassword: string;
}

export interface OnboardTenantResponse {
  tenantId: string;
  adminUserId: string;
}

/** Respuesta de baja/suspensión/reactivación. */
export interface TenantLifecycleResponse {
  tenantId: string;
  ruc: string;
  razonSocial: string;
  estadoAnterior: string;
  estado: string;
  deactivatedAtUtc?: string | null;
}

/** GET/POST /api/v1/admin/administradores */
export interface Administrador {
  id: string;
  username: string;
  estado: string;
  mfaHabilitado: boolean;
  createdAtUtc: string;
  ultimoLoginUtc?: string | null;
}

export interface CrearAdministradorRequest {
  username: string;
  password: string;
}

/** Etiqueta legible de un estado de empresa. */
export function etiquetaEstado(estado: string): string {
  switch (estado) {
    case 'Active':
      return 'Activa';
    case 'Suspended':
      return 'Suspendida';
    case 'Deactivated':
      return 'De baja';
    case 'Provisioning':
      return 'Aprovisionando';
    default:
      return estado;
  }
}
