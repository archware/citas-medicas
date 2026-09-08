import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PageHeaderDensity = 'comfortable' | 'compact';

/**
 * Encabezado canónico de página. Mantiene la jerarquía de título, contexto y
 * acciones sin conocer rutas, permisos ni reglas de negocio del consumidor.
 */
@Component({
  selector: 'app-page-header, prest-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {
  private static nextId = 0;
  private readonly generatedHeadingId = `prest-page-header-${++PageHeader.nextId}`;

  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly eyebrow = input<string | null>(null);
  readonly density = input<PageHeaderDensity>('comfortable');
  readonly headingId = input(this.generatedHeadingId);
  readonly actionsLabel = input('Acciones de la página');
}
