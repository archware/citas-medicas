---
title: "Panel de impresión de documentos"
subtitle: "Contrato visual para documentos A4 aislados"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-03"
---

# Panel de impresión de documentos

Organismo genérico para previsualizar y enviar a impresión un paquete de
documentos A4. Recibe páginas, campos, secciones, tablas y firmas tipadas; el
consumidor conserva el contenido y las reglas de negocio.

El selector canónico es `app-print-document-panel`. El alias
`prest-print-document-panel` se mantiene temporalmente para compatibilidad con
consumidores anteriores.

La impresión crea un documento aislado, inserta todos los valores con
`textContent`, usa papel A4 vertical y espera dos ciclos de render antes de
abrir el diálogo del navegador.
