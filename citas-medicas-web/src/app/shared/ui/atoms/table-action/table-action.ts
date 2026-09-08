import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type TableActionName =
  | 'view'
  | 'edit'
  | 'print'
  | 'reverse'
  | 'channels'
  | 'reset-password'
  | 'activate'
  | 'deactivate'
  | 'renew'
  | 'select'
  | 'late-fee'
  | 'delete'
  | 'custom';

export type TableActionTone =
  | 'neutral'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';
export type TableActionSize = 'sm' | 'md' | 'lg';

const ICONS: Readonly<Record<TableActionName, string>> = {
  view: 'fa-eye',
  edit: 'fa-pen-to-square',
  print: 'fa-print',
  reverse: 'fa-rotate-left',
  channels: 'fa-mobile-screen-button',
  'reset-password': 'fa-key',
  activate: 'fa-circle-check',
  deactivate: 'fa-circle-xmark',
  renew: 'fa-clock-rotate-left',
  select: 'fa-hand-pointer',
  'late-fee': 'fa-file-invoice-dollar',
  delete: 'fa-trash-can',
  custom: 'fa-ellipsis',
};

const TONES: Readonly<Record<TableActionName, TableActionTone>> = {
  view: 'info',
  edit: 'primary',
  print: 'primary',
  reverse: 'danger',
  channels: 'info',
  'reset-password': 'warning',
  activate: 'success',
  deactivate: 'danger',
  renew: 'warning',
  select: 'primary',
  'late-fee': 'warning',
  delete: 'danger',
  custom: 'neutral',
};

/** Acción iconográfica individual para grillas y listas compactas. */
@Component({
  selector: 'app-table-action, prest-table-action',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-action.html',
  styleUrl: './table-action.scss',
})
export class TableAction {
  readonly action = input<TableActionName>('view');
  readonly label = input.required<string>();
  /** Clase Font Awesome preferida. Acepta `print`, `fa-print` o clases completas. */
  readonly iconClass = input<string | null>(null);
  /** @deprecated Use iconClass. Se conserva para consumidores anteriores. */
  readonly icon = input<string | null>(null);
  readonly tone = input<TableActionTone | null>(null);
  readonly size = input<TableActionSize>('md');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly selected = input<boolean | null>(null);
  readonly triggered = output<MouseEvent>();

  protected readonly renderedIconClasses = computed(() =>
    resolveTableActionIcon(this.action(), this.iconClass() ?? this.icon()),
  );
  protected readonly toneClass = computed(
    () => `table-action table-action--${this.tone() ?? TONES[this.action()]} table-action--${this.size()}`,
  );

  protected onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.triggered.emit(event);
    }
  }
}

const FONT_AWESOME_STYLE_CLASSES = new Set([
  'fa-solid',
  'fa-regular',
  'fa-light',
  'fa-thin',
  'fa-duotone',
  'fa-brands',
  'fa-sharp',
]);

/** Normaliza alias de iconos sin convertir una acción válida en el fallback de tres puntos. */
export function normalizeTableActionIcon(
  value: string | null | undefined,
  fallback: string,
): string {
  const raw = value?.trim() || fallback;
  const tokens = raw.split(/\s+/).filter(Boolean);
  const style = tokens.find((token) => FONT_AWESOME_STYLE_CLASSES.has(token)) ?? 'fa-solid';
  const glyph =
    tokens.find(
      (token) => token.startsWith('fa-') && !FONT_AWESOME_STYLE_CLASSES.has(token),
    ) ?? `fa-${tokens.find((token) => !token.startsWith('fa-')) ?? fallback.replace(/^fa-/, '')}`;

  return `${style} ${glyph}`;
}

/** Resuelve el glifo semántico de una acción y admite una sobreescritura explícita. */
export function resolveTableActionIcon(
  action: TableActionName,
  value?: string | null,
): string {
  return normalizeTableActionIcon(value, ICONS[action]);
}

/** Comparte el tono semántico con grupos de acciones y otros consumidores Atomic. */
export function resolveTableActionTone(action: TableActionName): TableActionTone {
  return TONES[action];
}
