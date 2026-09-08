---
title: "Continuidad de agentes para el frontend administrativo"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-08-24"
document_type: "guía operativa"
status: "vigente"
version: "1.0.0"
change_id: "ECO-20260823-003"
---

# Continuidad de agentes para el frontend administrativo

## Propósito y límites

`saas-admin-front` es la consola Angular 22 para el propietario y los
administradores de plataforma. Gestiona empresas, altas, estados de servicio,
administradores y seguridad con segundo factor. No representa la interfaz de un
inquilino y no debe incorporar permisos de empresa propios del ERP o del POS.
La API pertenece a `10022024-BASE-WEB`; la lógica visual reutilizable pertenece
a la fuente canónica `-Atomic-UI`.

## Orden obligatorio de lectura

1. `C:\Users\cotaha\source\repos\AGENTS.md`.
2. `C:\Users\cotaha\Documents\Repos2\DOCTRINA_MAESTRA_UNIFICADA.md`.
3. `C:\Users\cotaha\Documents\Repos2\ESTANDAR_DOCUMENTAL_AGENTES.md`.
4. `C:\Users\cotaha\source\repos\saas-admin-front\AGENTS.md`.
5. Este documento.
6. [`ATOMIC_GOVERNANCE.md`](ATOMIC_GOVERNANCE.md),
   [`atomic-provenance.json`](atomic-provenance.json) y
   [`ATOMIC_DECISION_5.7.md`](ATOMIC_DECISION_5.7.md).
7. [`../README.md`](../README.md), el roadmap activo en `.agents/roadmaps/`,
   [`../CHANGELOG.md`](../CHANGELOG.md) y
   [`../LESSONS_LEARNED.md`](../LESSONS_LEARNED.md).

El roadmap documental de este paquete es
[`ROADMAP_20260823_continuidad_documental_agentes.md`](../.agents/roadmaps/ROADMAP_20260823_continuidad_documental_agentes.md).

No se encontraron habilidades ni flujos locales adicionales en el baseline.
Las habilidades institucionales declaradas por la raíz siguen siendo
obligatorias cuando el entorno las expone. El prompt común se encuentra en
`C:\Users\cotaha\Documents\Repos2\PROMPT_MAESTRO_CONTINUIDAD_AGENTES.md`.

## Arquitectura efectiva

| Zona | Responsabilidad | Restricción |
|---|---|---|
| `src/app/core/auth` | Autenticación de plataforma, guard e interceptor | No contiene componentes visuales reutilizables |
| `src/app/core/admin` | Cliente HTTP de administración | Mantiene contratos tipados y no replica reglas del backend |
| `src/app/core/http` | Construcción común de URL API | No conoce componentes ni estado de páginas |
| `src/app/features/auth` | Login y activación del segundo factor | Solo orquesta intención de interfaz |
| `src/app/features/empresas` | Listado, alta y cambio de estado de empresas | No traslada reglas de aprovisionamiento al navegador |
| `src/app/features/administradores` | Gestión de administradores de plataforma | Conserva la frontera de autorización del backend |
| `src/app/features/perfil` y `shell` | Seguridad personal y navegación | Componen objetos gobernados |
| `src/app/shared/ui` | Copia gobernada del ADN Atomic | No se edita de forma aislada en este consumidor |

Las rutas públicas son `/login` y `/activar-mfa`; el área `/app` contiene
empresas, alta de empresa, administradores y seguridad. La identidad de
plataforma y el segundo factor no se mezclarán con el flujo multiinquilino de
los otros consumidores.

## Estado doctrinal real

El manifiesto local fija la política Atomic 1.2.2, la versión 5.7.4, el OID
`c6fe16b94c736bb0eda22b555d8b7806510f73c7` y la huella
`0343e9cccf737e6cee5de1498a9d7889beec41a1f3598cd4f34e386335cb291f`.
Declara 76 componentes: 42 exactos y 34 adaptados; también declara cinco
servicios gobernados exactos.

La fuente canónica de trabajo informa una versión posterior y una transición
todavía no publicada como referencia estable para estos consumidores. Por ello,
el manifiesto 5.7.4 continúa como contrato vigente hasta una propagación
coordinada con OID, huella, pruebas y changelog comunes.

El escaneo de `src/app/shared/ui` registró este baseline de líneas coincidentes:

| Señal de deuda | Líneas coincidentes |
|---|---:|
| `@Input`, `@Output` o `EventEmitter` | 428 |
| estilos embebidos en TypeScript | 62 |
| atributos o bindings de estilo | 33 |
| medidas expresadas en `px` | 304 |
| referencias `prest-` | 23 |

La rebanada `ECO-20260824-002` dejó la vertical Empresas con el selector
público `app-`, estilos externos, guardas de doble envío y 14 pruebas
(listado, vacío, error, transiciones, error en diálogo, doble envío,
validación, payload y navegación); su roadmap es
[`ROADMAP_20260824_empresas_frontend_atomico.md`](../.agents/roadmaps/ROADMAP_20260824_empresas_frontend_atomico.md).
Con la autorización posterior de T10, el recuadro del QR pasó a blanco
explícito (contraste físico de escaneo, no color temático) y
`npm run check:atomic` quedó en 0; el roadmap cerró completo. Deuda
pendiente de asignación propia: `prest-*` en `administradores.component.ts`.

Los conteos son indicadores textuales y no sustituyen una revisión semántica.
La deuda no se corregirá directamente en la copia local: se resolverá primero
en Atomic UI y se propagará después. `ECO-20260823-003` solo la documenta.

## Comandos y compuertas descubiertos

La preparación de cada unidad utiliza:

```powershell
git branch --show-current
git rev-parse HEAD
git status --short --branch
git diff --stat
npm ci
```

Las compuertas declaradas por `package.json` son:

```powershell
npm run check:atomic
npm test -- --watch=false
npm run build
npm run check
git diff --check
```

`npm run check` encadena gobierno Atomic, pruebas sin observación continua y
build de producción. El checkout indicado por `ATOMIC_UI_ROOT` debe tener
exactamente el OID fijado por `atomic-provenance.json`; no se modificará la
fuente canónica ni se falsificará el manifiesto para hacer pasar la compuerta.
Existen 43 archivos `*.spec.ts` en el baseline, pero el número de pruebas
aprobadas deberá registrarse desde la salida real de cada ejecución.

## Protocolo de trabajo

1. Se capturará el baseline Git y se preservarán cambios preexistentes.
2. Se abrirá primero un roadmap local con un único flujo de plataforma.
3. Se fijarán contratos de API, autorización y estados visibles mediante pruebas.
4. Si falta un objeto visual, el consumidor se detendrá y el objeto se creará
   primero en `-Atomic-UI` con Signals, estilos externos y tokens.
5. La propagación actualizará manifiesto, ADR, OID, versión y huella de forma
   verificable; las features continuarán usando el selector `app-`.
6. Se ejecutarán compuertas focales y después `npm run check`.
7. Changelog, lecciones y roadmap registrarán resultado, deuda y rollback.

Los contratos de autenticación, MFA y administración no se cambiarán junto con
una migración visual salvo que el roadmap autorice y pruebe ambas fronteras.

## Definición de terminado

Una unidad termina cuando conserva rutas y autorización, no crea un segundo
sistema visual, utiliza contratos Signals para componentes modificados, no
introduce estilos inline ni medidas rígidas, mantiene procedencia verificable,
supera pruebas y build, y documenta evidencia exacta. Un gate Atomic verde con
la versión anterior no demuestra que toda la deuda nueva haya sido retirada.

## Seguridad, riesgos y rollback

No se registrarán contraseñas, claves de administración, secretos MFA, tokens
JWT, códigos de recuperación ni respuestas internas. No se ejecutarán
despliegues, publicaciones, commits, push, merge o rebase sin autorización.

Los riesgos principales son confundir identidad de plataforma con identidad de
inquilino, romper el segundo factor, crear divergencia visual y actualizar la
procedencia contra un checkout equivocado. El rollback restaura la versión
anterior del consumidor y su manifiesto como una unidad; nunca conserva hashes
nuevos con archivos antiguos. El rollback documental retira solo la entrada del
identificador afectado y preserva la historia previa.
