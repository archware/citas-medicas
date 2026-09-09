# citas-medicas-web â€” Consola del dueÃ±o

Front de **administraciÃ³n de plataforma** del Sistema de Citas Médicas: la pantalla del **dueÃ±o**
(y de los administradores que designe) para gobernar las empresas: alta, suspensiÃ³n por
impago, baja y reactivaciÃ³n, y la gestiÃ³n de los propios administradores de plataforma.

No es un front de empresa: aquÃ­ no hay permisos por tenant. La identidad es propia
(`plataforma.administradores`, backend `10022024-BASE-WEB`), el login es
`POST /api/v1/plataforma/auth/login`, el **segundo factor es obligatorio** y la sesiÃ³n
lleva el claim `scope=plataforma`, que es lo que acepta la puerta de administraciÃ³n
(`AdminApiKeyAuthorizationFilter`: token de plataforma **o** `X-Admin-Key`).

Hermano de `citas-medicas-web` (ERP) y `citas-medicas-web` (POS): misma base Angular 22 zoneless,
misma copia gobernada de **Atomic-UI 5.7.4** en `src/app/shared/ui` (no se edita) y las
mismas reglas de gobierno (`AGENTS.md`, `docs/ATOMIC_GOVERNANCE.md`).

## Pantallas

| Ruta | QuÃ© hace |
|---|---|
| `/login` | Usuario + contraseÃ±a; si falta el cÃ³digo â†’ segundo paso MFA; si el MFA aÃºn no estÃ¡ enrolado â†’ `/activar-mfa`. |
| `/activar-mfa` | Enrolamiento obligatorio con el token de arranque: generar clave, confirmar con TOTP, guardar cÃ³digos de recuperaciÃ³n. |
| `/app/empresas` | Todas las empresas (estado, usuarios, BD) con **Suspender / Dar de baja / Reactivar** (confirmaciÃ³n + motivo del error inline). |
| `/app/empresas/nueva` | Alta de empresa (onboarding): RUC, razÃ³n social, BD, administrador. |
| `/app/administradores` | Administradores de plataforma: listado y alta (polÃ­tica de contraseÃ±as del chasis). |
| `/app/seguridad` | Perfil y segundo factor (desactivar con cÃ³digo para volver a enrolar). |

## Desarrollo

```bash
npm ci
npm start            # http://localhost:5005 â€” proxy /api â†’ http://127.0.0.1:5002 (proxy.conf.json)
npm test -- --watch=false
npm run build
```

El backend debe tener `Modules:Admin` y `Modules:Tenancy` habilitados (el `saas-stack` ya lo hace).

### Primer dueÃ±o (una sola vez)

La primera cuenta se crea con la **llave de administraciÃ³n** (break-glass), nunca desde el front:

```bash
curl -X POST http://localhost:5002/api/v1/admin/administradores \
  -H "X-Admin-Key: $BASEWEB_ADMIN_APIKEY" -H "Content-Type: application/json" \
  -d '{"username":"dueno","password":"<contraseÃ±a fuerte: 12+, mayÃºs, minÃºs, dÃ­gito, sÃ­mbolo>"}'
```

DespuÃ©s: `/login` â†’ el backend responde `mfaSetupRequired` â†’ `/activar-mfa` â†’ entra con el cÃ³digo.

## Docker (saas-stack)

Servicio `citasfront` en `10022024-BASE-WEB/deploy/saas-stack/compose.yaml`
(`http://localhost:5005`, nginx same-origin con proxy de `/api` al chasis):

```bash
docker compose -f deploy/saas-stack/compose.yaml up -d --build citasfront
```

## Gobierno Atomic

`npm run check:atomic` compara `src/app/shared/ui` con el checkout pineado de
`archware/-Atomic-UI` (`docs/atomic-provenance.json` â†’ `atomicRef`). Exporta
`ATOMIC_UI_ROOT` apuntando a un clon en ese commit si no estÃ¡ en `../-Atomic-UI`.
Prohibido en features: etiquetas nativas (`<button>`, `<input>`, `<table>`â€¦), `style=`
inline y colores fijos; se compone con los Ã¡tomos/organismos del barrel `@shared/ui`.

