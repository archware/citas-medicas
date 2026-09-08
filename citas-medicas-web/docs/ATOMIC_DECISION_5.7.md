---
title: 'Decisión de adaptación — migración a Atomic 5.7.4 / política 1.2.2'
date: '2026-08-13'
change_id: 'ATOMIC-5.7-MIGRACION'
---

# Registro de decisión: specs en Vitest

Este consumidor se migró a Atomic 5.7.4 propagando en modo exacto TODOS los
ficheros de implementación (.ts/.html/.css/.scss) de los componentes
divergentes; la única divergencia que se conserva son los `*.spec.ts`.

Justificación (guía MIGRAR_A_5.7.md §2): el ADN corre Karma con Jasmine y este
consumidor corre Vitest, de modo que una propagación exacta de los specs no
compila (`toBeTrue`/`jasmine.createSpy` no existen) y además sobrescribiría la
cobertura propia del consumidor. La divergencia queda acotada a los ficheros de
prueba y declarada componente a componente en `docs/atomic-provenance.json`.

Decisión tomada por el equipo del ERP (sesión de migración 2026-08-13).

## Adenda: specs en jsdom (2026-08-13)

Los specs del consumidor corren en Vitest sobre jsdom. Tras la adaptación
Jasmine→Vitest (codemod: matchers, spies, timers, polyfills de matchMedia,
startViewTransition y <dialog>), quedan **20 tests `skip`** en dos categorías:

1. **Medición de layout real** (grid templates en px, anchos calculados,
   geometría de overlays): jsdom no ejecuta layout; su cobertura vive en el
   ADN (Karma/Chrome real).
2. **Inconsistencia del propio ADN en 5.7.4**: `table.component.spec.ts`
   espera la clase `atomic-table--columns` y roles retirados por el revert de
   los roles de tabla (24d83aa); la clase no existe en ningún fuente no-spec
   de Atomic. REPORTAR a Atomic: su suite en HEAD no puede estar verde.

Cada test saltado lleva la anotación en el propio fichero.
