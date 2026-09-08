---
title: "Vertical Empresas de la consola con selector app- y estilos externos"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-24"
last_updated: "2026-08-24"
document_type: "roadmap"
status: "completado"
version: "1.0.0"
change_id: "ECO-20260824-002"
branch: "master"
baseline_oid: "d76418f54f9527c6fdaa31b21811d1d646da93d5"
---

# Vertical Empresas de la consola con selector app- y estilos externos

## Objetivo

Migrar la unidad vertical Empresas (`EmpresasComponent`,
`NuevaEmpresaComponent`) al selector público `app-` y a estilos en archivos
CSS externos, conservando listado, alta, suspensión, baja y reactivación con
sus contratos HTTP, la seguridad de plataforma y los estados visibles
(carga, vacío, error, éxito, confirmación, bloqueo y notificaciones).

## Estado inicial protegido

Rama `master`, OID base `d76418f54f9527c6fdaa31b21811d1d646da93d5`, sin
remoto configurado, árbol limpio (`git status` vacío, `git diff --stat`
vacío). No hay cambios preexistentes sin confirmar. Trabajo terminado que no
se repite: la consola del dueño (`ECO` previos de esta rama), el paquete
documental `ECO-20260823-003` y la vertical de Compras del ERP
(`ECO-20260824-001`, repositorio hermano).

## Baseline comprobado de la vertical

- `empresas.component.ts` usa `prest-data-table`, `prest-table-action` (×3),
  `prest-form-dialog` y `prest-form-dialog-actions`; el ADN local expone
  selectores duales (`app-data-table, prest-data-table`, etc.), por lo que la
  conmutación es solo del consumidor y no toca `src/app/shared/ui`.
- Ambos componentes declaran `styles: [...]` embebidos; su contenido ya usa
  tokens y `rem` (sin `px`, sin estilos inline, sin Tailwind).
- `ejecutar()` y `guardar()` no tienen guarda de doble envío en el método
  (solo el `[disabled]` del botón).
- Pruebas existentes: `empresas.component.spec.ts` con 2 escenarios (listado
  con estados legibles; suspender con confirmación, endpoint y recarga).
  Faltan: vacío, error, baja, reactivación, doble envío, validación del alta
  y navegación.
- `docs/atomic-provenance.json` ya apunta a `../-Atomic-UI` con OID
  `c6fe16b…` (no se toca). `administradores.component.ts` también usa
  `prest-*`, pero está fuera del alcance: queda como deuda registrada.

## Alcance y exclusiones

Autorizado: `src/app/features/empresas/**`; `src/app/core/admin/**` solo para
pruebas o tipado compatible; este roadmap; `CHANGELOG.md`;
`LESSONS_LEARNED.md`; `docs/CONTINUIDAD_AGENTES.md`. Excluidos:
Administradores, autenticación, MFA, `src/app/shared/ui`, `-Atomic-UI`,
`app.routes.ts` y contratos del backend.

## Diseño resuelto

1. **Selectores.** `prest-data-table` → `app-data-table`,
   `prest-table-action` → `app-table-action`, `prest-form-dialog` →
   `app-form-dialog`, `prest-form-dialog-actions` →
   `app-form-dialog-actions`. Los alias duales del ADN permanecen (retirarlos
   es una asignación posterior sobre Atomic).
2. **Estilos.** `empresas.component.css` y `nueva-empresa.component.css`
   junto a sus componentes, con el mismo contenido (tokens y `rem`);
   `styleUrl` en lugar de `styles: [...]`.
3. **Doble envío.** `ejecutar()` y `guardar()` retornan si ya hay una
   operación en vuelo.
4. **Pruebas.** Se conservan los 2 escenarios existentes y se añaden: vacío
   (estado `empty`), error de listado con mensaje extraído, baja y
   reactivación (endpoint correcto por acción), error de negocio dentro del
   diálogo (no cierra, no recarga), doble envío en `ejecutar` y en `guardar`,
   validación del alta (inválido no llama; `dbName` con RUC no llama),
   payload del onboarding, y navegación (alta exitosa → `/app/empresas`;
   cancelar → `/app/empresas`).
5. **Sin cambios** en `core/admin` (contratos ya tipados y en uso por
   Administradores), rutas ni manifiesto.

## Tareas

- [x] T1. Conmutar los cuatro selectores `prest-*` a `app-*` en
      `EmpresasComponent`.
- [x] T2. Externalizar estilos de `EmpresasComponent`.
- [x] T3. Externalizar estilos de `NuevaEmpresaComponent`.
- [x] T4. Guardas de doble envío en `ejecutar()` y `guardar()`.
- [x] T5. Ampliar `empresas.component.spec.ts` (vacío, error, baja,
      reactivación, error en diálogo, doble envío) conservando los 2
      escenarios existentes (2 → 8).
- [x] T6. Crear `nueva-empresa.component.spec.ts` (validación, payload,
      navegación, doble envío, error inline; 6 escenarios).
- [x] T7. Compuertas ejecutadas: pruebas, build y `git diff --check` en
      verde; `check:atomic` termina en 1 por un color fijo preexistente en
      `activar-mfa` (demostrado sobre el baseline; ver Resultado).
- [x] T8. Actualizar `CHANGELOG.md`, `LESSONS_LEARNED.md` y
      `docs/CONTINUIDAD_AGENTES.md` de forma acumulativa.
- [x] T9. Compuerta documental central y registro de evidencia.
- [x] T10. (Autorización expresa del usuario: «termina todo».) El recuadro
      del QR pasó a `background: white` explícito — contraste físico de
      escaneo, no color temático: el token del tema sería oscuro en modo
      oscuro y volvería el QR inescaneable — y `npm run check:atomic`
      terminó en 0.

## Criterios de aceptación

1. Cero `prest-*` en `src/app/features/empresas/**`.
2. Ambos componentes con CSS externo; sin `styles:` embebidos, estilos
   inline, `px` rígidos ni Tailwind en la vertical.
3. Rutas `/app/empresas` y `/app/empresas/nueva` y las cinco operaciones
   (listado, alta, suspensión, baja, reactivación) intactas con sus
   contratos.
4. Confirmación, bloqueo (`procesando`/`guardando`), errores inline, recarga
   y notificaciones toast preservados.
5. Pruebas cubren listado, vacío, error, transiciones, doble envío,
   validación y navegación.
6. `src/app/shared/ui` y `docs/atomic-provenance.json` sin modificaciones.
7. Pruebas, build, `check:atomic` y `git diff --check` correctos.

## Validaciones planificadas

```powershell
$env:ATOMIC_UI_ROOT = "<scratchpad>/atomic-clean"   # checkout limpio en c6fe16b…
npm run check:atomic
npm test -- --watch=false
npm run build
git diff --check
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\cotaha\Documents\Repos2\.agents\scripts\validar-documentacion-proyectos.ps1
```

## Riesgos

- Que `app-table-action` no exista como selector del átomo: se verifica en el
  ADN antes de conmutar; si solo existiera el alias, la compilación y las
  pruebas fallarían de forma cerrada.
- Romper el flujo de confirmación al mover estilos: el contenido de las
  reglas no cambia, solo su ubicación; las pruebas del diálogo fijan el
  comportamiento.
- El repositorio no tiene remoto: el rollback es exclusivamente local.

## Compatibilidad y rollback

Sin cambios de rutas, contratos HTTP ni manifiesto de procedencia; los alias
`prest-` del ADN permanecen para cualquier otro consumidor (retirada N/N−1 en
asignación posterior). Rollback: restaurar los dos componentes y el spec al
OID base y retirar los dos CSS y el spec nuevos; las entradas documentales de
`ECO-20260824-002` se retiran sin tocar el historial.

## Resultado y evidencia

Ejecución del 2026-08-24. La vertical quedó conforme a la doctrina:

- Conmutación verificada por búsqueda: cero `prest-*`, cero `styles:`
  embebidos, cero estilos inline y cero `px` en
  `src/app/features/empresas/**`; `src/app/shared/ui` y
  `docs/atomic-provenance.json` sin modificaciones (git status).
- Archivos nuevos: `empresas.component.css`, `nueva-empresa.component.css`,
  `nueva-empresa.component.spec.ts` (6 escenarios) y este roadmap.
  Modificados: `empresas.component.ts` (selectores `app-`, `styleUrl`,
  guarda en `ejecutar()`), `nueva-empresa.component.ts` (`styleUrl`, guarda
  en `guardar()`), `empresas.component.spec.ts` (2 → 8 escenarios).
- `npm test -- --watch=false`: 315 aprobadas, 0 fallidas, 20 omitidas
  (44 archivos de spec; incluye los 14 escenarios de la vertical).
- `npm run build`: correcto. `git diff --check`: limpio. Compuerta
  documental central: `DOCUMENTATION_GATE_OK`, 14/14 proyectos.
- `npm run check:atomic` con `ATOMIC_UI_ROOT` en un clon limpio verificado
  del OID `c6fe16b94c736bb0eda22b555d8b7806510f73c7`: código 1 con un único
  hallazgo — «Color fijo fuera de tokens» por el fallback `#fff` de
  `var(--surface-0, #fff)` en
  `src/app/features/auth/activar-mfa/activar-mfa.component.ts:114`
  (recuadro del QR). La misma compuerta sobre un worktree del baseline
  `d76418f54f9527c6fdaa31b21811d1d646da93d5` produce idéntico código y
  hallazgo: deuda preexistente, ajena a esta rebanada (módulo MFA excluido
  del alcance). La vertical Empresas quedó en cero hallazgos propios.

Cierre de T10 (autorización posterior del usuario): compuertas repetidas —
`check:atomic` en 0 («política 1.2.2, 76 componentes y 5 servicios con
procedencia y cero violaciones»), 315 aprobadas / 0 fallidas / 20 omitidas,
build correcto y `git diff --check` limpio. Deuda registrada para
asignaciones futuras: `prest-*` en `administradores.component.ts`. Todas las
tareas con evidencia: roadmap completado.
