---
title: "Panel de comprobante térmico"
subtitle: "Contrato visual para impresión mediante el controlador del sistema"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-03"
---

# Panel de comprobante térmico

Organismo para presentar un comprobante y generar su impresión térmica.

El selector canónico es `app-receipt-panel`. El alias `prest-receipt-panel` se
mantiene temporalmente para compatibilidad con consumidores anteriores.

- El consumidor entrega campos ya formateados y el texto autoritativo.
- La impresión usa papel de 58 mm y un ancho imprimible de 48 mm.
- El contenido imprimible de 48 mm se centra dentro del papel de 58 mm, con
  márgenes laterales simétricos de 5 mm.
- La fuente de 7 pt permite que 32 columnas monoespaciadas quepan realmente
  dentro de los 384 puntos del cabezal.
- La página CSS usa tamaño automático y respeta el formato físico elegido en el
  controlador. No calcula una altura propia porque Edge puede centrarla dentro
  de una hoja fija mayor.
- El relleno vertical canónico es de 1 mm.
- `print()` crea un documento temporal que contiene solamente el ticket y
  después abre el diálogo nativo del navegador.
- El texto se inserta mediante `textContent`; no se interpreta como HTML.
- El navegador y el controlador conservan la autoridad sobre encabezados,
  pies y longitud física del papel.
- El documento temporal copia los tokens canónicos, espera dos ciclos de
  render y permanece disponible hasta que el navegador emite `afterprint`.
- El texto de impresión usa negro/blanco puros y peso 700 para evitar tramado
  gris o trazos tenues en cabezales térmicos monocromos.
- No envía comandos ESC/POS, no enumera dispositivos y no contiene reglas
  financieras.
