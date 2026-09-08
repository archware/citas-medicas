---
title: "Regla para agentes del frontend administrativo"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-08-23"
document_type: "instrucción para agentes"
status: "vigente"
version: "1.0.0"
change_id: "ECO-20260823-003"
canonical_doctrine: "C:\\Users\\cotaha\\Documents\\Repos2\\DOCTRINA_MAESTRA_UNIFICADA.md"
documentary_standard: "C:\\Users\\cotaha\\Documents\\Repos2\\ESTANDAR_DOCUMENTAL_AGENTES.md"
---

# Contrato obligatorio para agentes

> `ATOMIC_GOVERNANCE_REQUIRED`

Antes de modificar interfaz, leer `docs/ATOMIC_GOVERNANCE.md` y
`docs/atomic-provenance.json`.

`-Atomic-UI` es la única fuente de verdad visual. No crear en esta aplicación
átomos, moléculas, organismos, superficies, plantillas, controles, diálogos,
tablas, tokens o patrones visuales reutilizables. Si falta un objeto, crearlo y
validarlo primero en Atomic; después propagarlo y registrar su procedencia.

Toda página o feature nueva debe componerse con el ADN existente. La lógica de
negocio permanece en esta aplicación. Antes de entregar cambios se debe ejecutar
`npm run check:atomic`; está prohibido omitir, debilitar o eludir esa compuerta.

## Jerarquía y lectura obligatoria

Antes de auditar o modificar el repositorio se leerán completos, en este orden:

1. `C:\Users\cotaha\source\repos\AGENTS.md`;
2. `C:\Users\cotaha\Documents\Repos2\DOCTRINA_MAESTRA_UNIFICADA.md`;
3. `C:\Users\cotaha\Documents\Repos2\ESTANDAR_DOCUMENTAL_AGENTES.md`;
4. este archivo;
5. `C:\Users\cotaha\source\repos\saas-admin-front\docs\CONTINUIDAD_AGENTES.md`;
6. `docs/ATOMIC_GOVERNANCE.md`, `docs/atomic-provenance.json` y el roadmap activo.

La guía local obligatoria se identifica también mediante la ruta relativa exacta
`docs/CONTINUIDAD_AGENTES.md`.

Las restricciones de la sesión y la doctrina maestra prevalecen. Esta regla
local conserva `ATOMIC_GOVERNANCE_REQUIRED` y puede reforzarla, pero no permite
debilitar Signals, estilos externos, tokens, el selector `app-` ni la
procedencia verificable desde `-Atomic-UI`.

## Ciclo de trabajo y seguridad

Antes de editar se registrarán ruta, rama, OID, remoto,
`git status --short --branch` y `git diff --stat`; todo cambio preexistente se
preservará. Se abrirá o actualizará primero un roadmap en `.agents/roadmaps/`.
La unidad será pequeña y compatible. Al cierre se actualizarán
`CHANGELOG.md`, `LESSONS_LEARNED.md` y el roadmap con evidencia y rollback.

No se autorizan por defecto despliegues, publicaciones, commits, push, merge,
rebase, escrituras en bases reales ni retirada de contratos. No se incluirán
credenciales, tokens, datos personales ni respuestas internas del backend.

## Validaciones locales

Una modificación de producto ejecutará `npm ci`, `npm run check:atomic`,
`npm test -- --watch=false`, `npm run build`, revisión completa del diff y
`git diff --check`. `npm run check` encadena la compuerta Atomic, las pruebas y
el build. El checkout Atomic indicado por `ATOMIC_UI_ROOT` deberá coincidir con
el OID completo fijado en el manifiesto; una ruta local no demuestra identidad.

El prompt común está en
`C:\Users\cotaha\Documents\Repos2\PROMPT_MAESTRO_CONTINUIDAD_AGENTES.md`.
