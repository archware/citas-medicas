---
title: "Lecciones aprendidas del frontend administrativo"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-08-24"
document_type: "lecciones aprendidas"
status: "vigente"
version: "1.0.0"
change_id: "ECO-20260823-003"
---

# Lecciones aprendidas del frontend administrativo

No se encontró otro archivo de lecciones en el baseline. Este documento queda
como índice canónico local y deberá ampliarse de forma acumulativa.

## La gobernanza visual y la doctrina maestra son controles simultáneos

**Evidencia observada:** `AGENTS.md` ya impedía crear objetos visuales en el
consumidor, pero no enlazaba la doctrina común ni su ciclo documental.

**Decisión generalizable:** la regla `ATOMIC_GOVERNANCE_REQUIRED` se conserva y
se aplica junto con Signals, estilos externos, selectores `app-`, seguridad y
trazabilidad. Ninguna autoridad local debilita la superior.

**Mecanismo preventivo:** el orden de lectura incluye doctrina, estándar,
continuidad, gobierno Atomic, procedencia y roadmap antes de editar.

**Alcance:** aplica a toda interfaz consumidora; no traslada la lógica de
administración de plataforma hacia `-Atomic-UI`.

## Una ruta Atomic no demuestra una procedencia válida

**Evidencia observada:** el manifiesto consumidor fija Atomic 5.7.4, política
1.2.2, OID `c6fe16b94c736bb0eda22b555d8b7806510f73c7` y una huella SHA-256. La fuente
canónica de trabajo ya declara otra versión y contiene una transición no
publicada para el siguiente ciclo.

**Decisión generalizable:** una propagación solo se acepta cuando OID, remoto,
versión, política y huella coinciden. No se apuntará `ATOMIC_UI_ROOT` a un
checkout distinto para forzar una compuerta.

**Mecanismo preventivo:** `npm run check:atomic` falla de forma cerrada y toda
actualización requiere un identificador coordinado en fuente y consumidor.

**Alcance:** aplica a componentes y servicios gobernados; las features conservan
su lógica local aunque compongan el ADN visual compartido.

## Un inventario documental no corrige deuda ejecutable

**Evidencia observada:** el escaneo de `shared/ui` detecta decoradores antiguos,
estilos embebidos, bindings de estilo, medidas rígidas y aliases históricos.

**Decisión generalizable:** esos hallazgos se registran como baseline y se
migran por unidades coordinadas después de estabilizar Atomic. Este cambio no
se atribuye una corrección de producto.

**Mecanismo preventivo:** changelog y roadmap distinguen documentación creada de
compuertas de código realmente ejecutadas.

**Alcance:** aplica al estado observado el 23 de agosto de 2026 y deberá
actualizarse después de cada propagación verificable.

## Una compuerta se contrasta contra el baseline antes de atribuir hallazgos

**Evidencia observada:** durante `ECO-20260824-002`, `npm run check:atomic`
terminó en 1 señalando un color fijo en
`src/app/features/auth/activar-mfa/activar-mfa.component.ts` (el fallback
`#fff` de `var(--surface-0, #fff)` del recuadro del QR), archivo que la
vertical Empresas no tocó. La misma compuerta sobre un worktree del OID base
`d76418f54f9527c6fdaa31b21811d1d646da93d5` produjo el mismo hallazgo: el rojo
era preexistente.

**Decisión generalizable:** antes de atribuir un hallazgo de compuerta a la
unidad en curso, se reproduce la compuerta sobre el baseline. Si también
falla, se registra como deuda preexistente con su causa exacta (archivo y
línea) y se corrige en una asignación propia; el alcance no se amplía en
silencio ni se declara verde una compuerta roja.

**Mecanismo preventivo:** el roadmap registra el OID base y el código de
salida real de cada compuerta; la deuda señalada queda en la guía de
continuidad con la tarea pendiente que la cierra.

**Alcance:** no exime de dejar en cero los archivos de la propia unidad — la
vertical Empresas quedó sin `prest-*`, estilos embebidos, inline ni `px`.
