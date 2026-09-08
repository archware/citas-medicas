import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type QueryToolbarDensity = 'comfortable' | 'compact';
export type QueryToolbarLayout = 'auto' | 'inline' | 'stacked';

/**
 * Barra canónica para filtros y acciones de consulta. Los controles, permisos
 * y eventos permanecen bajo responsabilidad del consumidor.
 */
@Component({
  selector: 'app-query-toolbar, prest-query-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './query-toolbar.html',
  styleUrl: './query-toolbar.scss',
})
export class QueryToolbar {
  readonly density = input<QueryToolbarDensity>('comfortable');
  readonly layout = input<QueryToolbarLayout>('auto');
  readonly accessibleLabel = input('Filtros y acciones');
}
