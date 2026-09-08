#!/usr/bin/env node
/*
LANZADOR DE LA COMPUERTA DE REGLAS ATOMIC — CORE-GATES-20260824-01

Las cinco reglas de la Ley C -Signals, hojas externas, selectores, valores CSS y
escala tipografica- se comprobaban SOLO dentro del ADN. Aqui no las miraba nadie,
y por eso convivian decoradores, `styles` embebidos, medidas rigidas y selectores
`prest-*` con todas las compuertas en verde.

POR QUE UN LANZADOR Y NO UNA COPIA. Vendorizar las reglas crearia una segunda
implementacion, y el dia que una se afine en el ADN esta se quedaria atras sin
que nadie lo note. El lanzador resuelve el ADN desde el MISMO manifiesto que ya
usa `check:atomic` -`docs/atomic-provenance.json`- y ejecuta la compuerta
publicada en `governance/consumer/`. Una sola implementacion, y la dependencia
del arbol Atomic no es nueva: la procedencia ya lo exigia.

La deuda heredada vive en `docs/atomic-gate-baseline.json`. La compuerta la
tolera y bloquea todo lo que no este ahi. Ver el encabezado de la compuerta para
el porque del trinquete.
*/

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const consumerRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifiesto = JSON.parse(
  readFileSync(join(consumerRoot, 'docs/atomic-provenance.json'), 'utf8'),
);
const atomicRoot = resolve(consumerRoot, manifiesto.atomicRepository);
const compuerta = join(atomicRoot, 'governance/consumer/check-atomic-rules.mjs');

if (!existsSync(compuerta)) {
  console.error(
    `No se encontro la compuerta de reglas Atomic en ${compuerta}.\n` +
      'Se resuelve desde `atomicRepository` de docs/atomic-provenance.json; ' +
      'compruebe que el arbol Atomic esta disponible en esa ruta.',
  );
  process.exit(1);
}

const resultado = spawnSync(
  process.execPath,
  [
    compuerta,
    `--consumer-root=${consumerRoot}`,
    '--ui-root=src/app/shared/ui',
    '--src-root=src',
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit' },
);

process.exit(resultado.status ?? 1);
