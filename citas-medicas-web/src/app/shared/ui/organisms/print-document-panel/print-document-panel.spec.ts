import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrintDocumentPanel } from './print-document-panel';

describe('PrintDocumentPanel', () => {
  let fixture: ComponentFixture<PrintDocumentPanel>;
  let component: PrintDocumentPanel;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintDocumentPanel],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PrintDocumentPanel);
    component = fixture.componentInstance;
  });

  it('renders the document inventory without exposing a full table on screen', () => {
    fixture.componentRef.setInput('documents', [
      {
        id: 'contract',
        title: 'Contrato',
        fields: [{ id: 'number', label: 'Número', value: 'CR-001' }],
        sections: [
          {
            id: 'schedule',
            heading: 'Cronograma',
            fields: [{ id: 'currency', label: 'Moneda', value: 'PEN' }],
            table: {
              caption: 'Cuotas',
              columns: [{ key: 'number', label: 'N.º' }],
              rows: [{ number: '1' }, { number: '2' }],
            },
          },
        ],
        signatures: ['Responsable', 'Usuario'],
        footer: 'Documento de prueba',
      },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Contrato');
    expect(fixture.nativeElement.textContent).toContain('CR-001');
    expect(fixture.nativeElement.textContent).toContain('PEN');
    expect(fixture.nativeElement.textContent).toContain('Responsable');
    expect(fixture.nativeElement.textContent).toContain('Documento de prueba');
    expect(fixture.nativeElement.textContent).toContain('Cuotas · 2 registro(s)');
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    const title = fixture.nativeElement.querySelector('h2') as HTMLElement;
    expect(
      fixture.nativeElement.querySelector('[role="region"]').getAttribute('aria-labelledby'),
    ).toBe(title.id);
  });

  it('refuses to print an empty package', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    expect(component.print()).toBe(false);
    expect(open).not.toHaveBeenCalled();
  });

  it('builds an isolated A4 document and treats values as plain text', () => {
    const printDocument = document.implementation.createHTMLDocument('');
    const frames: FrameRequestCallback[] = [];
    const lifecycle = new EventTarget();
    const print = vi.fn();
    const value = {
      document: printDocument,
      closed: false,
      focus: vi.fn(),
      print,
      close: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        frames.push(callback);
        return frames.length;
      },
      addEventListener: lifecycle.addEventListener.bind(lifecycle),
      removeEventListener: lifecycle.removeEventListener.bind(lifecycle),
    } as unknown as Window;

    fixture.componentRef.setInput('documents', [
      {
        id: 'contract',
        title: 'Contrato <script>bad()</script>',
        sections: [
          {
            id: 'terms',
            heading: 'Condiciones',
            paragraphs: ['Contenido seguro'],
          },
        ],
      },
      {
        id: 'schedule',
        title: 'Cronograma',
        sections: [
          {
            id: 'table',
            heading: 'Cuotas',
            table: {
              caption: 'Cronograma',
              columns: [{ key: 'number', label: 'N.º', align: 'end' }],
              rows: [{ number: '1' }],
            },
          },
        ],
      },
    ]);
    fixture.detectChanges();
    vi.spyOn(window, 'open').mockReturnValue(value);

    expect(component.print()).toBe(true);
    expect(printDocument.querySelectorAll('.print-page').length).toBe(2);
    expect(printDocument.title).toBe('Documentos');
    expect(printDocument.querySelector('script')).toBeNull();
    expect(printDocument.body.textContent).toContain('<script>bad()</script>');
    const printStyles = printDocument.querySelector('style')?.textContent ?? '';
    expect(printStyles).toContain('size: A4 portrait');
    expect(printStyles).not.toContain('#f3f4f6');
    expect(printStyles).not.toMatch(/var\(--print-document-[^,]+,\s*#/);
    while (frames.length > 0) {
      frames.shift()?.(0);
    }
    expect(print).toHaveBeenCalledTimes(1);
  });
});
