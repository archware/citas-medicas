import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import {
  LayoutShellComponent,
  SidebarComponent,
  ThemeSwitcherComponent,
  TopbarComponent,
  type SidebarMenuItem,
} from '@shared/ui';

import { AuthStore } from '../../core/auth/auth.store';
import { AuthApiService } from '../../core/auth/auth-api.service';

/**
 * Shell de la CONSOLA DEL DUEÑO (anatomía Atomic: LayoutShell + Sidebar + Topbar).
 * El menú es fijo: el administrador de plataforma no tiene permisos por tenant; su
 * sesión (scope=plataforma) ya es la autorización.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, LayoutShellComponent, SidebarComponent, TopbarComponent, ThemeSwitcherComponent],
  template: `
    <app-layout-shell
      [sidebarVisible]="sidebarVisible()"
      footerCompanyName="Demo Citas Medicas · Consola del dueño"
      [footerVersion]="'v1.0.0'"
      footerEnvironment="PLATAFORMA"
      (closeSidebar)="sidebarVisible.set(false)"
    >
      <app-sidebar
        slot="sidebar"
        logoText="Consola"
        logoIcon="fa-solid fa-building-shield"
        [menuItems]="menuItems()"
        (navigate)="onNavigate($event)"
      />
      <app-topbar
        slot="topbar"
        title="Consola del dueño"
        [userName]="username()"
        [userInitials]="initials()"
        userRole="Administrador de plataforma"
        [showNotifications]="false"
        [showLanguageSwitcher]="false"
        (toggleSidebar)="sidebarVisible.set(!sidebarVisible())"
        (userAction)="onUserAction($event)"
        (logout)="logout()"
      >
        <app-theme-switcher />
      </app-topbar>

      <router-outlet />
    </app-layout-shell>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class ShellComponent {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly authApi = inject(AuthApiService);

  protected readonly sidebarVisible = signal(true);
  private readonly currentUrl = signal(this.router.url);

  protected readonly menuItems = computed<SidebarMenuItem[]>(() => {
    const url = this.currentUrl();
    const item = (id: string, label: string, icon: string, route: string): SidebarMenuItem => ({
      id,
      label,
      icon,
      route,
      active: route === '/app/empresas' ? url === route || url.startsWith(route + '?') : url.startsWith(route),
    });
    return [
      item('citas', 'Citas', 'fa-solid fa-calendar-check', '/app/citas'),
      item('pacientes', 'Pacientes', 'fa-solid fa-users', '/app/pacientes'),
      item('medicos', 'Medicos', 'fa-solid fa-user-doctor', '/app/medicos'),
      item('seguridad', 'Seguridad / MFA', 'fa-solid fa-shield-halved', '/app/seguridad'),
    ];
  });

  protected readonly username = computed(() => this.authStore.username() || 'Dueño');
  protected readonly initials = computed(() => {
    const nombre = this.username().trim();
    return nombre ? nombre.slice(0, 2).toUpperCase() : 'DU';
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }

  protected onNavigate(item: SidebarMenuItem): void {
    if (item.route) {
      void this.router.navigateByUrl(item.route);
    }
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.sidebarVisible.set(false);
    }
  }

  /** Acciones del menú de usuario del topbar: perfil y configuración llevan a Seguridad. */
  protected onUserAction(action: { id: string }): void {
    if (action.id === 'settings' || action.id === 'profile' || action.id === 'password') {
      void this.router.navigateByUrl('/app/seguridad');
    }
  }

  protected logout(): void {
    // La sesión local se borra PRIMERO y de forma síncrona; después se pide la
    // revocación al servidor con las credenciales que acabamos de retirar.
    const acceso = this.authStore.token();
    const refresh = this.authStore.refreshToken();

    this.authStore.logout();
    void this.router.navigate(['/login']);

    this.authApi.logout(acceso, refresh).subscribe();
  }
}
