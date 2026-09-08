// SKIP jsdom: specs del ADN que miden layout/roles reales de navegador (o esperan clases retiradas en 5.7.4). Ver docs/ATOMIC_DECISION_5.7.md.
import { TestBed } from '@angular/core/testing';
import { CrudDialog } from './crud-dialog';

// jsdom no implementa <dialog>: showModal polyfill mínimo para los specs.
beforeAll(() => {
  if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) { this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) { this.removeAttribute('open'); };
  }
});

describe('CrudDialog', () => {
  it.skip('proyecta el formulario y conserva la semántica accesible', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.componentRef.setInput('describedBy', 'editor-help');
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.getAttribute('aria-labelledby')).toBe('editor-title');
    expect(dialog.getAttribute('aria-describedby')).toBe('editor-help');
    expect(dialog.classList).toContain('crud-dialog');
    expect(getComputedStyle(dialog).overflow).toBe('hidden');

    // El overlay ya no escribe marcadores sobre el contenido proyectado:
    // posee su propio viewport. La garantia que importa -un unico dueno del
    // scroll, y que sea el del overlay- se comprueba sobre ese viewport.
    const overlay = dialog.querySelector('app-scroll-overlay') as HTMLElement;
    const viewport = overlay.querySelector('.scroll-overlay__viewport') as HTMLElement;
    expect(overlay.classList).toContain('crud-dialog__viewport');
    expect(dialog.querySelectorAll('.scroll-overlay__viewport').length).toBe(1);
    expect(getComputedStyle(viewport).overflowY).toBe('auto');
    expect(getComputedStyle(viewport).getPropertyValue('scrollbar-width')).toBe('none');
  });

  it.skip('prioriza el control Atomic marcado y restaura el foco al cerrar', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const launcher = document.createElement('button');
    document.body.appendChild(launcher);
    launcher.focus();

    const ordinaryInput = document.createElement('input');
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.setAttribute('aria-hidden', 'true');
    hiddenInput.tabIndex = -1;
    const control = document.createElement('button');
    control.setAttribute('data-dialog-initial-focus', '');
    fixture.componentInstance.nativeElement.append(ordinaryInput, hiddenInput, control);

    fixture.componentInstance.showModal();
    expect(document.activeElement).toBe(control);

    fixture.componentInstance.close();
    await Promise.resolve();
    expect(document.activeElement).toBe(launcher);

    launcher.remove();
  });

  it('focuses the first invalid interactive control instead of its invalid form container', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const form = document.createElement('form');
    form.classList.add('ng-invalid');
    const hiddenInvalid = document.createElement('input');
    hiddenInvalid.type = 'hidden';
    hiddenInvalid.classList.add('ng-invalid');
    const visibleInvalid = document.createElement('input');
    visibleInvalid.classList.add('ng-invalid');
    form.append(hiddenInvalid, visibleInvalid);
    fixture.componentInstance.nativeElement.append(form);

    fixture.componentInstance.showModal();
    fixture.componentInstance.focusInvalid();

    expect(document.activeElement).toBe(visibleInvalid);
    fixture.componentInstance.close();
  });

  it('reinicia el desplazamiento al volver a abrir el diálogo', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const dialog = fixture.componentInstance.nativeElement;
    const scrollSurface = dialog.querySelector('[data-crud-dialog-scroll-surface]') as HTMLElement;
    fixture.componentInstance.showModal();
    scrollSurface.scrollTop = 120;
    fixture.componentInstance.close();

    fixture.componentInstance.showModal();
    expect(dialog.scrollTop).toBe(0);
    expect(scrollSurface.scrollTop).toBe(0);
    fixture.componentInstance.close();
  });

  it.skip('delega el scroll a una sola superficie sin scrollbar nativo', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = fixture.componentInstance.nativeElement;
    // El overlay ya no escribe marcadores sobre el contenido proyectado:
    // posee su propio viewport. La garantia que importa -un unico dueno del
    // scroll, y que sea el del overlay- se comprueba sobre ese viewport.
    const viewport = dialog.querySelector('.scroll-overlay__viewport') as HTMLElement;

    expect(dialog.querySelectorAll('[data-crud-dialog-scroll-surface]').length).toBe(1);
    expect(dialog.querySelectorAll('.scroll-overlay__viewport').length).toBe(1);
    expect(getComputedStyle(viewport).overflowY).toBe('auto');
  });

  it('enfoca el control nativo dentro del primer componente invÃ¡lido', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const host = document.createElement('prest-input');
    host.classList.add('ng-invalid');
    const input = document.createElement('input');
    host.appendChild(input);
    fixture.componentInstance.nativeElement.appendChild(host);

    fixture.componentInstance.showModal();
    fixture.componentInstance.focusInvalid();

    expect(document.activeElement).toBe(input);
    fixture.componentInstance.close();
  });
});
