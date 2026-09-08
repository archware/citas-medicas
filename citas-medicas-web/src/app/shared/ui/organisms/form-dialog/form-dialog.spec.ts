import { TestBed } from '@angular/core/testing';
import { FormDialog, FormDialogActions } from './form-dialog';

describe('FormDialog', () => {
  it('renderiza encabezado y descripción con relaciones accesibles', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialog] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('eyebrow', 'Seguridad');
    fixture.componentRef.setInput('title', 'Editar acceso');
    fixture.componentRef.setInput('description', 'Defina el rol y su vigencia.');
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const title = fixture.nativeElement.querySelector('.form-dialog__title') as HTMLElement;
    const description = fixture.nativeElement.querySelector(
      '.form-dialog__description',
    ) as HTMLElement;

    expect(title.textContent).toContain('Editar acceso');
    expect(description.textContent).toContain('Defina el rol');
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.getAttribute('aria-describedby')).toBe(description.id);
    const header = fixture.nativeElement.querySelector('.form-dialog__header') as HTMLElement;
    expect(getComputedStyle(header).position).toBe('sticky');
    expect(getComputedStyle(header).top).toBe('0px');
    expect(getComputedStyle(header).alignItems).toBe('center');
  });

  it('propaga Escape como cancelación controlada', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialog] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('title', 'Crear usuario');
    const cancellations: Event[] = [];
    fixture.componentInstance.cancelled.subscribe((event) => cancellations.push(event));
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(cancellations).toEqual([cancel]);
  });

  it('sincroniza el estado declarativo de apertura y cierre', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialog] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('title', 'Crear usuario');
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.showModal = () => dialog.setAttribute('open', '');

    fixture.componentRef.setInput('opened', true);
    fixture.detectChanges();

    expect(dialog.hasAttribute('open')).toBe(true);
    dialog.removeAttribute('open');
    dialog.dispatchEvent(new Event('close'));
    fixture.detectChanges();

    expect(fixture.componentInstance.opened()).toBe(false);
  });

  it('expone el estado ocupado y bloquea la cancelacion mientras guarda', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialog] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('title', 'Crear usuario');
    fixture.componentRef.setInput('busy', true);
    const cancellations: Event[] = [];
    fixture.componentInstance.cancelled.subscribe((event) => cancellations.push(event));
    fixture.detectChanges();

    const article = fixture.nativeElement.querySelector('.form-dialog') as HTMLElement;
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));

    expect(article.getAttribute('aria-busy')).toBe('true');
    expect(cancellations).toEqual([]);
  });
});

describe('FormDialogActions', () => {
  it('publica un grupo canónico para las acciones proyectadas', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialogActions] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialogActions);
    fixture.detectChanges();

    const actions = fixture.nativeElement.querySelector('.form-dialog-actions') as HTMLElement;
    const host = fixture.nativeElement as HTMLElement;

    expect(actions).not.toBeNull();
    expect(getComputedStyle(host).position).toBe('sticky');
    expect(getComputedStyle(host).bottom).toBe('0px');
  });
});
