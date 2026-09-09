---
title: "Continuidad de agentes para el frontend administrativo"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-08-24"
document_type: "guÃ­a operativa"
status: "vigente"
version: "1.0.0"
change_id: "ECO-20260823-003"
---

# Continuidad de agentes para el frontend administrativo

## PropÃ³sito y lÃ­mites

`citas-medicas-web` es la consola Angular 22 para el propietario y los
administradores de plataforma. Gestiona empresas, altas, estados de servicio,
administradores y seguridad con segundo factor. No representa la interfaz de un
inquilino y no debe incorporar permisos de empresa propios del ERP o del POS.
La API pertenece a `10022024-BASE-WEB`; la lÃ³gica visual reutilizable pertenece
a la fuente canÃ³nica `-Atomic-UI`.

## Orden obligatorio de lectura

1. `C:\Users\cotaha\source\repos\AGENTS.md`.
2. `C:\Users\cotaha\Documents\Repos2\DOCTRINA_MAESTRA_UNIFICADA.md`.
3. `C:\Users\cotaha\Documents\Repos2\ESTANDAR_DOCUMENTAL_AGENTES.md`.
4. `C:\Users\cotaha\source\repos\citas-medicas-web\AGENTS.md`.
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
Las habilidades institucionales declaradas por la raÃ­z siguen siendo
obligatorias cuando el entorno las expone. El prompt comÃºn se encuentra en
`C:\Users\cotaha\Documents\Repos2\PROMPT_MAESTRO_CONTINUIDAD_AGENTES.md`.

## Arquitectura efectiva

| Zona | Responsabilidad | RestricciÃ³n |
|---|---|---|
| `src/app/core/auth` | AutenticaciÃ³n de plataforma, guard e interceptor | No contiene componentes visuales reutilizables |
| `src/app/core/admin` | Cliente HTTP de administraciÃ³n | Mantiene contratos tipados y no replica reglas del backend |
| `src/app/core/http` | ConstrucciÃ³n comÃºn de URL API | No conoce componentes ni estado de pÃ¡ginas |
| `src/app/features/auth` | Login y activaciÃ³n del segundo factor | Solo orquesta intenciÃ³n de interfaz |
| `src/app/features/empresas` | Listado, alta y cambio de estado de empresas | No traslada reglas de aprovisionamiento al navegador |
| `src/app/features/administradores` | GestiÃ³n de administradores de plataforma | Conserva la frontera de autorizaciÃ³n del backend |
| `src/app/features/perfil` y `shell` | Seguridad personal y navegaciÃ³n | Componen objetos gobernados |
| `src/app/shared/ui` | Copia gobernada del ADN Atomic | No se edita de forma aislada en este consumidor |

Las rutas pÃºblicas son `/login` y `/activar-mfa`; el Ã¡rea `/app` contiene
empresas, alta de empresa, administradores y seguridad. La identidad de
plataforma y el segundo factor no se mezclarÃ¡n con el flujo multiinquilino de
los otros consumidores.

## Estado doctrinal real

El manifiesto local fija la polÃ­tica Atomic 1.2.2, la versiÃ³n 5.7.4, el OID
`c6fe16b94c736bb0eda22b555d8b7806510f73c7` y la huella
`0343e9cccf737e6cee5de1498a9d7889beec41a1f3598cd4f34e386335cb291f`.
Declara 76 componentes: 42 exactos y 34 adaptados; tambiÃ©n declara cinco
servicios gobernados exactos.

La fuente canÃ³nica de trabajo informa una versiÃ³n posterior y una transiciÃ³n
todavÃ­a no publicada como referencia estable para estos consumidores. Por ello,
el manifiesto 5.7.4 continÃºa como contrato vigente hasta una propagaciÃ³n
coordinada con OID, huella, pruebas y changelog comunes.

El escaneo de `src/app/shared/ui` registrÃ³ este baseline de lÃ­neas coincidentes:

| SeÃ±al de deuda | LÃ­neas coincidentes |
|---|---:|
| `@Input`, `@Output` o `EventEmitter` | 428 |
| estilos embebidos en TypeScript | 62 |
| atributos o bindings de estilo | 33 |
| medidas expresadas en `px` | 304 |
| referencias `prest-` | 23 |

La rebanada `ECO-20260824-002` dejÃ³ la vertical Empresas con el selector
pÃºblico `app-`, estilos externos, guardas de doble envÃ­o y 14 pruebas
(listado, vacÃ­o, error, transiciones, error en diÃ¡logo, doble envÃ­o,
validaciÃ³n, payload y navegaciÃ³n); su roadmap es
[`ROADMAP_20260824_empresas_frontend_atomico.md`](../.agents/roadmaps/ROADMAP_20260824_empresas_frontend_atomico.md).
Con la autorizaciÃ³n posterior de T10, el recuadro del QR pasÃ³ a blanco
explÃ­cito (contraste fÃ­sico de escaneo, no color temÃ¡tico) y
`npm run check:atomic` quedÃ³ en 0; el roadmap cerrÃ³ completo. Deuda
pendiente de asignaciÃ³n propia: `prest-*` en `administradores.component.ts`.

Los conteos son indicadores textuales y no sustituyen una revisiÃ³n semÃ¡ntica.
La deuda no se corregirÃ¡ directamente en la copia local: se resolverÃ¡ primero
en Atomic UI y se propagarÃ¡ despuÃ©s. `ECO-20260823-003` solo la documenta.

## Comandos y compuertas descubiertos

La preparaciÃ³n de cada unidad utiliza:

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

`npm run check` encadena gobierno Atomic, pruebas sin observaciÃ³n continua y
build de producciÃ³n. El checkout indicado por `ATOMIC_UI_ROOT` debe tener
exactamente el OID fijado por `atomic-provenance.json`; no se modificarÃ¡ la
fuente canÃ³nica ni se falsificarÃ¡ el manifiesto para hacer pasar la compuerta.
Existen 43 archivos `*.spec.ts` en el baseline, pero el nÃºmero de pruebas
aprobadas deberÃ¡ registrarse desde la salida real de cada ejecuciÃ³n.

## Protocolo de trabajo

1. Se capturarÃ¡ el baseline Git y se preservarÃ¡n cambios preexistentes.
2. Se abrirÃ¡ primero un roadmap local con un Ãºnico flujo de plataforma.
3. Se fijarÃ¡n contratos de API, autorizaciÃ³n y estados visibles mediante pruebas.
4. Si falta un objeto visual, el consumidor se detendrÃ¡ y el objeto se crearÃ¡
   primero en `-Atomic-UI` con Signals, estilos externos y tokens.
5. La propagaciÃ³n actualizarÃ¡ manifiesto, ADR, OID, versiÃ³n y huella de forma
   verificable; las features continuarÃ¡n usando el selector `app-`.
6. Se ejecutarÃ¡n compuertas focales y despuÃ©s `npm run check`.
7. Changelog, lecciones y roadmap registrarÃ¡n resultado, deuda y rollback.

Los contratos de autenticaciÃ³n, MFA y administraciÃ³n no se cambiarÃ¡n junto con
una migraciÃ³n visual salvo que el roadmap autorice y pruebe ambas fronteras.

## DefiniciÃ³n de terminado

Una unidad termina cuando conserva rutas y autorizaciÃ³n, no crea un segundo
sistema visual, utiliza contratos Signals para componentes modificados, no
introduce estilos inline ni medidas rÃ­gidas, mantiene procedencia verificable,
supera pruebas y build, y documenta evidencia exacta. Un gate Atomic verde con
la versiÃ³n anterior no demuestra que toda la deuda nueva haya sido retirada.

## Seguridad, riesgos y rollback

No se registrarÃ¡n contraseÃ±as, claves de administraciÃ³n, secretos MFA, tokens
JWT, cÃ³digos de recuperaciÃ³n ni respuestas internas. No se ejecutarÃ¡n
despliegues, publicaciones, commits, push, merge o rebase sin autorizaciÃ³n.

Los riesgos principales son confundir identidad de plataforma con identidad de
inquilino, romper el segundo factor, crear divergencia visual y actualizar la
procedencia contra un checkout equivocado. El rollback restaura la versiÃ³n
anterior del consumidor y su manifiesto como una unidad; nunca conserva hashes
nuevos con archivos antiguos. El rollback documental retira solo la entrada del
identificador afectado y preserva la historia previa.

