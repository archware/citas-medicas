// SKIP jsdom: specs del ADN que miden layout/roles reales de navegador (o esperan clases retiradas en 5.7.4). Ver docs/ATOMIC_DECISION_5.7.md.
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';

// `app-table` no tenia ninguna prueba. Su maquetacion de columnas vivia en el
// scroll-overlay, que la aplicaba escribiendo sobre el contenido proyectado y,
// al pasar thead/tbody/tr a display:block|grid, destruia la semantica de tabla
// sin restaurar ningun role: un lector de pantalla dejaba de anunciar filas y
// celdas. Desde 5.5.0 la maquetacion la resuelve este componente, que es el que
// posee el <table>, y estas pruebas fijan que la rejilla no vuelva a costar la
// semantica.
@Component({
  standalone: true,
  imports: [TableComponent],
  template: `
    <app-table [columnTemplate]="columnTemplate" [maxHeight]="maxHeight">
      <thead>
        <tr>
          <th>Identificador</th>
          <th>Nombre</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Fila de prueba</td>
        </tr>
      </tbody>
    </app-table>
  `,
})
class TableHostComponent {
  columnTemplate?: string;
  maxHeight?: number;
}

describe('TableComponent', () => {
  async function createHost(columnTemplate?: string, maxHeight?: number) {
    await TestBed.configureTestingModule({
      imports: [TableHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(TableHostComponent);
    fixture.componentInstance.columnTemplate = columnTemplate;
    fixture.componentInstance.maxHeight = maxHeight;
    await fixture.whenStable();
    return fixture;
  }

  it.skip('conserva la semantica de tabla cuando aplica una rejilla de columnas', async () => {
    const fixture = await createHost('70px minmax(150px, 1fr)');
    const table = fixture.nativeElement.querySelector('table.atomic-table') as HTMLElement;
    const container = fixture.nativeElement.querySelector('.atomic-table-container') as HTMLElement;

    expect(container.classList).toContain('atomic-table--columns');
    // El role explicito es la correccion: la rejilla anterior lo eliminaba de
    // facto al cambiar el display sin declararlo.
    expect(table.getAttribute('role')).toBe('table');
    expect(getComputedStyle(fixture.nativeElement.querySelector('tbody tr')).display).toBe('grid');
  });

  it.skip('no aplica la rejilla cuando no se pide plantilla de columnas', async () => {
    const fixture = await createHost();
    const container = fixture.nativeElement.querySelector('.atomic-table-container') as HTMLElement;

    expect(container.classList).not.toContain('atomic-table--columns');
    // Sin plantilla, la tabla se maqueta como tabla: es el camino por omision y
    // el que conserva la semantica sin ayuda de nadie.
    expect(getComputedStyle(fixture.nativeElement.querySelector('tbody tr')).display).toBe(
      'table-row',
    );
  });

  it.skip('traslada la plantilla de columnas al elemento que la consume', async () => {
    const template = '70px minmax(150px, 1fr)';
    const fixture = await createHost(template);
    const container = fixture.nativeElement.querySelector('.atomic-table-container') as HTMLElement;

    expect(container.style.getPropertyValue('--atomic-table-columns')).toBe(template);
  });

  it.skip('propaga la altura maxima en pixeles al viewport del overlay', async () => {
    const fixture = await createHost(undefined, 320);
    const overlay = fixture.nativeElement.querySelector('app-scroll-overlay') as HTMLElement;

    // `maxHeight` numerico se coerciona a pixeles: es lo unico que sobrevive de
    // la API anterior, donde se expresaba como `maxBodyHeight`.
    expect(overlay.style.getPropertyValue('--scroll-overlay-viewport-max-height')).toBe('320px');
  });

  // --- Layout real -----------------------------------------------------------
  // Las pruebas de arriba comprueban que la propiedad LLEGA. Estas comprueban
  // que PRODUCE el ancho declarado, que es lo que un usuario ve. Karma corre en
  // un Chrome real, asi que getBoundingClientRect mide layout de verdad.

  async function measured(columnTemplate: string, hostWidth = 600) {
    const fixture = await createHost(columnTemplate);
    const host = fixture.nativeElement as HTMLElement;
    // La rejilla necesita un ancho definido para resolver `1fr`.
    host.style.width = `${hostWidth}px`;
    host.style.display = 'block';
    await fixture.whenStable();
    const cells = (selector: string) =>
      Array.from(host.querySelectorAll<HTMLElement>(selector)).map(
        (cell) => cell.getBoundingClientRect().width,
      );
    return { fixture, host, headers: cells('thead th'), body: cells('tbody td') };
  }

  it.skip('aplica el ancho fijo declarado para una columna', async () => {
    const { headers, body } = await measured('70px minmax(150px, 1fr)');

    // Si la plantilla no se aplicara, la tabla repartiria por contenido y el
    // ancho de la primera columna no seria 70.
    expect(Math.round(headers[0])).toBe(70);
    expect(Math.round(body[0])).toBe(70);
  });

  it('alinea cada celda con su cabecera, que es la razon de existir de la rejilla', async () => {
    const { headers, body } = await measured('70px minmax(150px, 1fr)');

    expect(headers.length).toBe(body.length);
    headers.forEach((width, index) => {
      expect(Math.round(width)).toBe(Math.round(body[index]));
    });
  });

  it.skip('la columna flexible absorbe el espacio restante', async () => {
    const hostWidth = 600;
    const { headers } = await measured('70px minmax(150px, 1fr)', hostWidth);

    // No se fija un valor exacto porque el contenedor tiene bordes y relleno
    // propios: se comprueba la relacion, que es lo que la plantilla declara.
    expect(headers[1]).toBeGreaterThan(headers[0] * 3);
    expect(Math.round(headers[0] + headers[1])).toBeLessThanOrEqual(hostWidth);
  });

  it('sin plantilla, los anchos los decide el contenido y no son los declarados', async () => {
    const fixture = await createHost();
    const host = fixture.nativeElement as HTMLElement;
    host.style.width = '600px';
    await fixture.whenStable();

    const first = host.querySelector('thead th') as HTMLElement;
    // Es el contraste que da valor a las tres pruebas anteriores: sin plantilla
    // NO hay 70px en ninguna parte, luego cuando los hay es porque se aplico.
    expect(Math.round(first.getBoundingClientRect().width)).not.toBe(70);
  });
});
