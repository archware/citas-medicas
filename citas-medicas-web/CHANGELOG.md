---
title: "Historial de cambios del frontend administrativo"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-08-24"
document_type: "historial de cambios"
status: "vigente"
version: "1.0.0"
---

# Historial de cambios del frontend administrativo

## Sin publicar

### `CORE-GATES-20260824-01` — las cinco reglas de la Ley C se comprueban aquí

- Problema: `check:signals`, `check:selectors`, `check:css-values`,
  `check:external-styles` y `check:typography` existían **solo en el ADN**. Este
  repositorio podía escribir `@Input()`, `styles:` embebidos, medidas rígidas y
  selectores `prest-*` nuevos con sus compuertas en verde, porque ninguna los
  miraba. Al instalar la comprobación salieron **344 incumplimientos heredados**
  que llevaban ahí sin que nada se quejara.
- Decisión: se instala `check:atomic-rules`, un lanzador que resuelve el ADN
  desde el mismo manifiesto que ya usa `check:atomic` y ejecuta la compuerta
  publicada en `governance/consumer/check-atomic-rules.mjs`. No se vendorizan las
  reglas: una copia local se quedaría atrás el día que una se afine en la fuente.
- Trinquete, no interruptor: la deuda medida se congela en
  `docs/atomic-gate-baseline.json` y lo que no esté en la línea base rompe el
  build. Apagar las reglas hasta pagar la deuda las deja apagadas para siempre;
  encenderlas de golpe las haría desactivar por urgencia.
- Compatibilidad: no cambia ningún componente, plantilla ni estilo. Solo se
  añade la comprobación a la cadena `npm run check`.
- Archivos: `scripts/check-atomic-rules.mjs`, `docs/atomic-gate-baseline.json`,
  `package.json`, `CHANGELOG.md`.
- Validación: `npm run check:atomic-rules` en verde con 344 heredados y cero
  nuevos. La compuerta se probó rompiéndola en `prestamo_front_atomic`: ante una
  violación sintética devuelve 1 y señala archivo y línea.
- Riesgo y deuda: los 344 incumplimientos siguen ahí y ahora están contados. La
  línea base solo puede encoger. **`check:atomic` sigue en rojo por una causa
  distinta y anterior**: el ancla está en `5.7.4` / `c6fe16b`, a 38 commits de la
  fuente. Sincronizarla es una unidad aparte, todavía sin decidir.
- Rollback: retirar `check:atomic-rules` de la cadena `check` y eliminar el
  lanzador y la línea base. No hay estado que compensar.

### `ECO-20260824-002` — vertical Empresas con selector app- y estilos externos

- Problema: `EmpresasComponent` usaba los alias históricos `prest-data-table`,
  `prest-table-action`, `prest-form-dialog` y `prest-form-dialog-actions`, y
  ambos componentes de la vertical declaraban `styles:` embebidos; las
  transiciones y el alta carecían de pruebas de vacío, error, doble envío y
  navegación.
- Decisión: las plantillas conmutan al selector público `app-` (los alias
  duales del ADN permanecen para otros consumidores); los estilos pasan a
  `empresas.component.css` y `nueva-empresa.component.css` con el mismo
  contenido (tokens y `rem`); `ejecutar()` y `guardar()` incorporan guarda de
  doble envío.
- Compatibilidad: rutas `/app/empresas` y `/app/empresas/nueva` intactas; las
  cinco operaciones (listado, alta, suspensión, baja, reactivación) conservan
  método, ruta, cuerpo y respuesta; confirmación, bloqueo, errores inline,
  recarga y toasts preservados; `src/app/shared/ui` y
  `docs/atomic-provenance.json` sin cambios.
- Archivos: los dos componentes, dos CSS nuevos, `empresas.component.spec.ts`
  ampliado (2 → 8 escenarios), `nueva-empresa.component.spec.ts` nuevo
  (6 escenarios) y el roadmap
  `.agents/roadmaps/ROADMAP_20260824_empresas_frontend_atomico.md`.
- Validaciones: suite completa 315 aprobadas, 0 fallidas, 20 omitidas;
  `npm run build` correcto; `git diff --check` limpio; compuerta documental
  central aprobada. `npm run check:atomic` (checkout limpio del OID fijado)
  termina en 1 por un único hallazgo preexistente y ajeno a la rebanada: el
  fallback `#fff` de `var(--surface-0, #fff)` en
  `src/app/features/auth/activar-mfa/activar-mfa.component.ts` (línea 114,
  recuadro del QR); el mismo resultado se reprodujo sobre un worktree del
  baseline `d76418f`. La vertical Empresas quedó en cero hallazgos. Con la
  autorización expresa posterior («termina todo») el recuadro del QR pasó a
  `background: white` explícito — contraste físico de escaneo, no color
  temático — y la compuerta quedó en 0 («cero violaciones») con la suite
  completa nuevamente en verde (315/0/20) y build correcto.
- Riesgos y rollback: restaurar los dos componentes y el spec al OID base y
  retirar los CSS y el spec nuevos. Deuda registrada: `prest-*` en
  `administradores.component.ts` (fuera del alcance); el color del QR quedó
  resuelto bajo T10 autorizado.

### Documentación

- `ECO-20260823-003` amplió `AGENTS.md` y añadió el roadmap, la guía de
  continuidad y el índice de lecciones requeridos para reanudar trabajo con la
  doctrina y la gobernanza Atomic.
- La documentación registra arquitectura, rutas administrativas, compuertas,
  procedencia Atomic 5.7.4, deuda de Signals y estilos, límites de seguridad y
  rollback. El inventario no declara que esa deuda haya sido corregida.
- Se preservó íntegramente `ATOMIC_GOVERNANCE_REQUIRED`. No se modificaron
  código, contratos, configuración ejecutable ni dependencias.

### Validación

- Se verificaron enlaces declarados, metadatos de documentos nuevos, vocabulario
  institucional, alcance exclusivamente Markdown y `git diff --check`.

### Rollback

- La reversión retira únicamente las secciones y documentos identificados con
  `ECO-20260823-003`, restaurando el `AGENTS.md` anterior sin tocar producto.
