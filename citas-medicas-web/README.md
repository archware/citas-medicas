# saas-admin-front — Consola del dueño

Front de **administración de plataforma** del SaaS Mini-ERP: la pantalla del **dueño**
(y de los administradores que designe) para gobernar las empresas: alta, suspensión por
impago, baja y reactivación, y la gestión de los propios administradores de plataforma.

No es un front de empresa: aquí no hay permisos por tenant. La identidad es propia
(`plataforma.administradores`, backend `10022024-BASE-WEB`), el login es
`POST /api/v1/plataforma/auth/login`, el **segundo factor es obligatorio** y la sesión
lleva el claim `scope=plataforma`, que es lo que acepta la puerta de administración
(`AdminApiKeyAuthorizationFilter`: token de plataforma **o** `X-Admin-Key`).

Hermano de `saas-erp-front` (ERP) y `saas-pos-front` (POS): misma base Angular 22 zoneless,
misma copia gobernada de **Atomic-UI 5.7.4** en `src/app/shared/ui` (no se edita) y las
mismas reglas de gobierno (`AGENTS.md`, `docs/ATOMIC_GOVERNANCE.md`).

## Pantallas

| Ruta | Qué hace |
|---|---|
| `/login` | Usuario + contraseña; si falta el código → segundo paso MFA; si el MFA aún no está enrolado → `/activar-mfa`. |
| `/activar-mfa` | Enrolamiento obligatorio con el token de arranque: generar clave, confirmar con TOTP, guardar códigos de recuperación. |
| `/app/empresas` | Todas las empresas (estado, usuarios, BD) con **Suspender / Dar de baja / Reactivar** (confirmación + motivo del error inline). |
| `/app/empresas/nueva` | Alta de empresa (onboarding): RUC, razón social, BD, administrador. |
| `/app/administradores` | Administradores de plataforma: listado y alta (política de contraseñas del chasis). |
| `/app/seguridad` | Perfil y segundo factor (desactivar con código para volver a enrolar). |

## Desarrollo

```bash
npm ci
npm start            # http://localhost:5005 — proxy /api → http://127.0.0.1:5002 (proxy.conf.json)
npm test -- --watch=false
npm run build
```

El backend debe tener `Modules:Admin` y `Modules:Tenancy` habilitados (el `saas-stack` ya lo hace).

### Primer dueño (una sola vez)

La primera cuenta se crea con la **llave de administración** (break-glass), nunca desde el front:

```bash
curl -X POST http://localhost:5002/api/v1/admin/administradores \
  -H "X-Admin-Key: $BASEWEB_ADMIN_APIKEY" -H "Content-Type: application/json" \
  -d '{"username":"dueno","password":"<contraseña fuerte: 12+, mayús, minús, dígito, símbolo>"}'
```

Después: `/login` → el backend responde `mfaSetupRequired` → `/activar-mfa` → entra con el código.

## Docker (saas-stack)

Servicio `adminfront` en `10022024-BASE-WEB/deploy/saas-stack/compose.yaml`
(`http://localhost:5005`, nginx same-origin con proxy de `/api` al chasis):

```bash
docker compose -f deploy/saas-stack/compose.yaml up -d --build adminfront
```

## Gobierno Atomic

`npm run check:atomic` compara `src/app/shared/ui` con el checkout pineado de
`archware/-Atomic-UI` (`docs/atomic-provenance.json` → `atomicRef`). Exporta
`ATOMIC_UI_ROOT` apuntando a un clon en ese commit si no está en `../-Atomic-UI`.
Prohibido en features: etiquetas nativas (`<button>`, `<input>`, `<table>`…), `style=`
inline y colores fijos; se compone con los átomos/organismos del barrel `@shared/ui`.
