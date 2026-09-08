// SKIP jsdom: specs del ADN que miden layout/roles reales de navegador (o esperan clases retiradas en 5.7.4). Ver docs/ATOMIC_DECISION_5.7.md.
import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent, SidebarMenuItem } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  it('keeps flat items navigable and renders their FontAwesome icon', () => {
    const item: SidebarMenuItem = {
      id: 'home',
      label: 'Inicio',
      icon: 'fa-solid fa-house',
      route: '/home',
    };
    component.menuItems = [item];
    const navigate = vi.fn();
    component.navigate.subscribe(navigate);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.nav-link') as HTMLButtonElement;
    const icon = button.querySelector('.nav-icon') as HTMLElement;
    button.click();

    expect(icon.classList).toContain('fa-house');
    expect(navigate).toHaveBeenCalledExactlyOnceWith(item);
  });

  it.skip('delega la navegacion extensa a un unico ScrollOverlay', async () => {
    component.menuItems = Array.from({ length: 20 }, (_, index) => ({
      id: `item-${index}`,
      label: `Opcion ${index + 1}`,
      icon: 'fa-solid fa-circle',
    }));
    fixture.detectChanges();
    await fixture.whenStable();

    const overlay = fixture.nativeElement.querySelector(
      'app-scroll-overlay.sidebar-nav-overlay',
    ) as HTMLElement;
    // El overlay ya no escribe marcadores sobre el contenido proyectado:
    // posee su propio viewport. La garantia que importa -un unico dueno del
    // scroll, y que sea el del overlay- se comprueba sobre ese viewport.
    const viewport = overlay?.querySelector('.scroll-overlay__viewport') as HTMLElement;

    expect(overlay).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.scroll-overlay__viewport').length).toBe(1);
    expect(getComputedStyle(viewport).overflowY).toBe('auto');
    expect(getComputedStyle(viewport).getPropertyValue('scrollbar-width')).toBe('none');
  });

  it('toggles a group and emits navigation only for the selected child', () => {
    const child: SidebarMenuItem = {
      id: 'interest',
      label: 'Interés',
      icon: 'fa-solid fa-percent',
      route: '/interest',
    };
    component.menuItems = [
      {
        id: 'maintenance',
        label: 'Mantenimiento',
        icon: 'fa-solid fa-screwdriver-wrench',
        children: [child],
      },
    ];
    const navigate = vi.fn();
    component.navigate.subscribe(navigate);
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('.nav-link') as HTMLButtonElement;
    expect(group.getAttribute('aria-expanded')).toBe('false');

    group.click();
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll(
      '.nav-link',
    ) as NodeListOf<HTMLButtonElement>;
    expect(group.getAttribute('aria-expanded')).toBe('true');
    expect(links.length).toBe(2);
    expect(navigate).not.toHaveBeenCalled();

    links[1].click();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(child);
  });

  it('expands the ancestor of an active descendant and forwards the profile photo', () => {
    component.menuItems = [
      {
        id: 'security',
        label: 'Seguridad',
        icon: 'fa-solid fa-shield-halved',
        children: [
          {
            id: 'users',
            label: 'Usuarios',
            icon: 'fa-solid fa-users',
            active: true,
          },
        ],
      },
    ];
    component.user = {
      name: 'Usuario Demo',
      role: 'Administrador',
      photo: '/avatar.png',
    };
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.nav-link').length).toBe(2);
    expect(fixture.nativeElement.querySelector('app-avatar img')?.getAttribute('src')).toBe(
      '/avatar.png',
    );
  });

  it('moves focus between the actual menu buttons with the arrow keys', () => {
    component.menuItems = [
      { id: 'home', label: 'Inicio', icon: 'fa-solid fa-house', route: '/home' },
      { id: 'users', label: 'Usuarios', icon: 'fa-solid fa-users', route: '/users' },
    ];
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll(
      '.nav-link',
    ) as NodeListOf<HTMLButtonElement>;
    links[0].focus();
    links[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    expect(document.activeElement).toBe(links[1]);
  });
});
