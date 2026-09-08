// SKIP jsdom: specs del ADN que miden layout/roles reales de navegador (o esperan clases retiradas en 5.7.4). Ver docs/ATOMIC_DECISION_5.7.md.
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataTable, DataTableColumn, DataTableSortChange } from './data-table';

interface LoanRow {
  readonly id: number;
  readonly customer: string;
  readonly balance: number | null;
}

const columns: readonly DataTableColumn<LoanRow>[] = [
  { key: 'id', header: 'Código', sortable: true },
  { key: 'customer', header: 'Cliente', sortable: true },
  {
    key: 'balance',
    header: 'Saldo',
    sortable: true,
    align: 'end',
    format: (value) => (typeof value === 'number' ? `S/ ${value.toFixed(2)}` : '—'),
  },
];

const rows: readonly LoanRow[] = [
  { id: 20, customer: 'Zeta', balance: null },
  { id: 10, customer: 'Álvaro', balance: 125.5 },
  { id: 30, customer: 'Beatriz', balance: 80 },
];

@Component({
  imports: [DataTable],
  template: `
    <app-data-table
      caption="Créditos vigentes"
      [columns]="columns"
      [rows]="rows"
      actionsWidth="12rem"
      [trackBy]="trackById"
    >
      <ng-template #actions let-row let-index="index">
        <button
          class="edit-action"
          type="button"
          [attr.data-id]="$any(row).id"
          [attr.data-index]="index"
          (click)="edit($any(row).id)"
        >
          Editar
        </button>
        <button class="view-action" type="button">Ver</button>
        <button class="delete-action" type="button">Eliminar</button>
      </ng-template>
    </app-data-table>
  `,
})
class DataTableHost {
  protected readonly columns = columns;
  protected readonly rows = rows;
  protected readonly editedId = signal<number | null>(null);
  protected readonly trackById = (_index: number, row: LoanRow): number => row.id;

  protected edit(id: number): void {
    this.editedId.set(id);
  }
}

describe('DataTable', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTable],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  async function createTable(
    status: 'idle' | 'loading' | 'success' | 'empty' | 'error' = 'success',
  ) {
    const fixture = TestBed.createComponent(DataTable);
    fixture.componentRef.setInput('caption', 'Créditos vigentes');
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rows', rows);
    fixture.componentRef.setInput('status', status);
    await fixture.whenStable();
    return fixture;
  }

  it('renders a semantic, keyboard-scrollable table without forcing change detection', async () => {
    const fixture = await createTable();
    const region = fixture.nativeElement.querySelector('[role="region"]') as HTMLElement;
    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    const caption = table.querySelector('caption');
    const headers = table.querySelectorAll('th[scope="col"]');
    const firstRowCells = table.querySelectorAll('tbody tr:first-child td');

    expect(region.tabIndex).toBe(0);
    expect(region.getAttribute('aria-label')).toContain('Créditos vigentes');
    expect(caption?.textContent?.trim()).toBe('Créditos vigentes');
    expect(headers.length).toBe(4);
    expect(firstRowCells[0]?.textContent?.trim()).toBe('1');
    expect(firstRowCells[2]?.textContent?.trim()).toBe('Zeta');
    expect(firstRowCells[3]?.textContent?.trim()).toBe('—');
    expect(fixture.nativeElement.querySelector('.data-table__toolbar')).not.toBeNull();
  });

  it.skip('keeps a single horizontal scroll owner inside ScrollOverlay', async () => {
    const fixture = await createTable();
    const overlay = fixture.nativeElement.querySelector(
      '.data-table__viewport',
    ) as HTMLElement;
    const viewport = overlay.querySelector('.scroll-overlay__viewport') as HTMLElement;
    const overlayStyle = getComputedStyle(overlay);
    const viewportStyle = getComputedStyle(viewport);

    expect(overlayStyle.maxHeight).toBe('none');
    expect(overlayStyle.overflowX).toBe('hidden');
    expect(viewportStyle.overflowX).toBe('auto');
  });

  it('exposes an explicit compact density for wide operational grids', async () => {
    const fixture = await createTable();
    fixture.componentRef.setInput('density', 'compact');
    await fixture.whenStable();

    expect(
      fixture.nativeElement
        .querySelector('.data-table__region')
        ?.classList.contains('data-table__region--compact'),
    ).toBe(true);
  });

  it('keeps configured column widths in a CSS variable instead of inline width', async () => {
    const fixture = await createTable();
    fixture.componentRef.setInput('columns', [
      { ...columns[0], width: '5rem' },
      ...columns.slice(1),
    ]);
    await fixture.whenStable();

    const header = fixture.nativeElement.querySelector(
      'th[data-column="id"]',
    ) as HTMLTableCellElement;
    const cell = fixture.nativeElement.querySelector(
      'tbody tr:not(.data-table__state-row) td[data-column="id"]',
    ) as HTMLTableCellElement;

    expect(header.style.width).toBe('');
    expect(cell.style.width).toBe('');
    expect(header.style.getPropertyValue('--data-table-column-width')).toBe('5rem');
    expect(cell.style.getPropertyValue('--data-table-column-width')).toBe('5rem');
  });

  it('sorts stably through ascending, descending and none while updating aria-sort', async () => {
    const fixture = await createTable();
    const emitted: DataTableSortChange[] = [];
    fixture.componentInstance.sortChange.subscribe((sort) => emitted.push(sort));
    const customerHeader = fixture.nativeElement.querySelector(
      'th[data-column="customer"]',
    ) as HTMLTableCellElement;
    const sortButton = customerHeader.querySelector('button') as HTMLButtonElement;

    expect(sortButton.type).toBe('button');
    expect(sortButton.tabIndex).toBe(0);
    expect(customerHeader.getAttribute('aria-sort')).toBe('none');

    sortButton.click();
    await fixture.whenStable();
    expect(customerHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(renderedCustomers(fixture.nativeElement)).toEqual(['Álvaro', 'Beatriz', 'Zeta']);

    sortButton.click();
    await fixture.whenStable();
    expect(customerHeader.getAttribute('aria-sort')).toBe('descending');
    expect(renderedCustomers(fixture.nativeElement)).toEqual(['Zeta', 'Beatriz', 'Álvaro']);

    sortButton.click();
    await fixture.whenStable();
    expect(customerHeader.getAttribute('aria-sort')).toBe('none');
    expect(renderedCustomers(fixture.nativeElement)).toEqual(['Zeta', 'Álvaro', 'Beatriz']);
    expect(emitted.map(({ direction }) => direction)).toEqual(['asc', 'desc', null]);
  });

  it('keeps missing values last in both numeric sort directions', async () => {
    const fixture = await createTable();
    const sortButton = fixture.nativeElement.querySelector(
      'th[data-column="balance"] button',
    ) as HTMLButtonElement;

    sortButton.click();
    await fixture.whenStable();
    expect(renderedCustomers(fixture.nativeElement)).toEqual(['Beatriz', 'Álvaro', 'Zeta']);

    sortButton.click();
    await fixture.whenStable();
    expect(renderedCustomers(fixture.nativeElement)).toEqual(['Álvaro', 'Beatriz', 'Zeta']);
  });

  it('projects one actions template per row with row and sorted index context', async () => {
    await TestBed.configureTestingModule({ imports: [DataTableHost] }).compileComponents();
    const fixture = TestBed.createComponent(DataTableHost);
    await fixture.whenStable();
    const actions = fixture.nativeElement.querySelectorAll('.edit-action');

    expect(actions.length).toBe(3);
    expect(actions[0]?.getAttribute('data-id')).toBe('20');
    expect(actions[0]?.getAttribute('data-index')).toBe('0');
  });

  it('reserves a configurable column for three horizontal actions', async () => {
    await TestBed.configureTestingModule({ imports: [DataTableHost] }).compileComponents();
    const fixture = TestBed.createComponent(DataTableHost);
    await fixture.whenStable();
    const heading = fixture.nativeElement.querySelector(
      '.data-table__actions-heading',
    ) as HTMLTableCellElement;
    const actionCell = fixture.nativeElement.querySelector(
      '.data-table__actions',
    ) as HTMLTableCellElement;
    const firstActionList = actionCell.querySelector('.data-table__action-list') as HTMLElement;

    expect(heading.style.getPropertyValue('--data-table-actions-width')).toBe('12rem');
    expect(actionCell.style.getPropertyValue('--data-table-actions-width')).toBe('12rem');
    expect(firstActionList.querySelectorAll('button').length).toBe(3);
  });

  it('announces loading and changes to fresh rows through signal inputs in zoneless mode', async () => {
    const fixture = await createTable('loading');
    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;

    expect(table.getAttribute('aria-busy')).toBe('true');
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Cargando información',
    );

    fixture.componentRef.setInput('rows', [{ id: 40, customer: 'Carla', balance: 50 }]);
    fixture.componentRef.setInput('status', 'success');
    await fixture.whenStable();

    expect(table.getAttribute('aria-busy')).toBe('false');
    expect(renderedCustomers(fixture.nativeElement)).toEqual(['Carla']);
  });

  it('shows the empty state automatically for a successful empty result', async () => {
    const fixture = await createTable();
    fixture.componentRef.setInput('rows', []);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'No hay información para mostrar',
    );
  });

  it('renders an alert and emits retry from the error state', async () => {
    const fixture = await createTable('error');
    let retries = 0;
    fixture.componentInstance.retry.subscribe(() => retries++);
    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    const retryButton = alert.querySelector('button') as HTMLButtonElement;

    expect(alert.textContent).toContain('No fue posible cargar la información');
    expect(retryButton.type).toBe('button');
    retryButton.click();
    await fixture.whenStable();
    expect(retries).toBe(1);
  });

  it('renders the paginated range and current page from one-based inputs', async () => {
    const fixture = await createTable();
    fixture.componentRef.setInput('totalRecords', 45);
    fixture.componentRef.setInput('page', 2);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('hasPreviousPage', true);
    fixture.componentRef.setInput('hasNextPage', true);
    fixture.componentRef.setInput('showRowNumber', true);
    await fixture.whenStable();

    const summary = fixture.nativeElement.querySelector('.data-table__summary') as HTMLElement;
    const pageInfo = fixture.nativeElement.querySelector('.data-table__page-info') as HTMLElement;
    const pageSize = fixture.nativeElement.querySelector(
      '.data-table__page-size select',
    ) as HTMLSelectElement;

    expect(summary.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Mostrando 21 - 40 de 45 registro(s)',
    );
    expect(pageInfo.textContent).toContain('2 de 3');
    expect(pageSize.value).toBe('20');
    expect(
      fixture.nativeElement.querySelector(
        'tbody tr:not(.data-table__state-row) td[data-column="rowNumber"]',
      )?.textContent?.trim(),
    ).toBe('21');
  });

  it('renders a zero range and disables pagination for an empty result', async () => {
    const fixture = await createTable();
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('totalRecords', 0);
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('totalPages', 1);
    fixture.componentRef.setInput('hasPreviousPage', false);
    fixture.componentRef.setInput('hasNextPage', false);
    await fixture.whenStable();

    const summary = fixture.nativeElement.querySelector('.data-table__summary') as HTMLElement;
    const buttons = fixture.nativeElement.querySelectorAll(
      '.data-table__page-btn',
    ) as NodeListOf<HTMLButtonElement>;

    expect(summary.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Mostrando 0 - 0 de 0 registro(s)',
    );
    expect(buttons.length).toBe(2);
    expect(buttons[0]?.disabled).toBe(true);
    expect(buttons[1]?.disabled).toBe(true);
  });

  it('paginates complete local collections and keeps the row number continuous', async () => {
    const fixture = await createTable();
    fixture.componentRef.setInput('pagination', 'client');
    fixture.componentRef.setInput('page', 2);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('showRowNumber', true);
    fixture.componentRef.setInput(
      'rows',
      Array.from({ length: 12 }, (_, index) => ({
        id: index + 1,
        customer: `Cliente ${index + 1}`,
        balance: index + 1,
      })),
    );
    await fixture.whenStable();

    const toolbar = fixture.nativeElement.querySelector('.data-table__toolbar');
    const buttons = fixture.nativeElement.querySelectorAll(
      '.data-table__page-btn',
    ) as NodeListOf<HTMLButtonElement>;

    expect(toolbar).not.toBeNull();
    expect(renderedCustomers(fixture.nativeElement).length).toBe(2);
    expect(renderedCustomers(fixture.nativeElement)).toEqual(['Cliente 11', 'Cliente 12']);
    expect(
      fixture.nativeElement.querySelector(
        'tbody tr:not(.data-table__state-row) td[data-column="rowNumber"]',
      )?.textContent?.trim(),
    ).toBe('11');
    expect(buttons[0]?.disabled).toBe(false);
    expect(buttons[1]?.disabled).toBe(true);
  });

  it('honors an explicit pagination opt-out even when totalRecords is supplied', async () => {
    const fixture = await createTable();
    fixture.componentRef.setInput('pagination', 'none');
    fixture.componentRef.setInput('totalRecords', 45);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.data-table__toolbar')).toBeNull();
    expect(renderedCustomers(fixture.nativeElement)).toEqual(['Zeta', 'Álvaro', 'Beatriz']);
  });

  it('emits page size and previous or next one-based pages from the toolbar', async () => {
    const fixture = await createTable();
    fixture.componentRef.setInput('totalRecords', 45);
    fixture.componentRef.setInput('page', 2);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('hasPreviousPage', true);
    fixture.componentRef.setInput('hasNextPage', true);
    await fixture.whenStable();

    const pageSizes: number[] = [];
    const pages: number[] = [];
    fixture.componentInstance.pageSizeChange.subscribe((size) => pageSizes.push(size));
    fixture.componentInstance.pageChange.subscribe((page) => pages.push(page));

    const pageSize = fixture.nativeElement.querySelector(
      '.data-table__page-size select',
    ) as HTMLSelectElement;
    const buttons = fixture.nativeElement.querySelectorAll(
      '.data-table__page-btn',
    ) as NodeListOf<HTMLButtonElement>;
    pageSize.value = '20';
    pageSize.dispatchEvent(new Event('change'));
    buttons[0]?.click();
    buttons[1]?.click();
    await fixture.whenStable();

    expect(pageSizes).toEqual([20]);
    expect(pages).toEqual([1, 3]);
  });

  it('disables both page controls while loading and preserves boundary states', async () => {
    const fixture = await createTable('loading');
    fixture.componentRef.setInput('totalRecords', 30);
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('hasPreviousPage', false);
    fixture.componentRef.setInput('hasNextPage', true);
    await fixture.whenStable();

    const buttons = fixture.nativeElement.querySelectorAll(
      '.data-table__page-btn',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons[0]?.disabled).toBe(true);
    expect(buttons[1]?.disabled).toBe(true);

    fixture.componentRef.setInput('status', 'success');
    fixture.componentRef.setInput('page', 3);
    fixture.componentRef.setInput('hasPreviousPage', true);
    fixture.componentRef.setInput('hasNextPage', false);
    await fixture.whenStable();

    expect(buttons[0]?.disabled).toBe(false);
    expect(buttons[1]?.disabled).toBe(true);
  });
});

function renderedCustomers(root: HTMLElement): string[] {
  return Array.from(
    root.querySelectorAll(
      'tbody tr:not(.data-table__state-row) td[data-column="customer"]',
    ),
  ).map((cell) => cell.textContent?.trim() ?? '');
}
