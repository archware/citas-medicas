import { Injectable, signal } from '@angular/core';

export type PopupSize = 'sm' | 'md' | 'lg';
export type PopupType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface PopupButton {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  action: () => void;
}

export interface PopupConfig {
  id?: number;
  title: string;
  message?: string;
  type?: PopupType;
  size?: PopupSize;
  icon?: string;
  closable?: boolean;
  closeOnBackdrop?: boolean;
  buttons?: PopupButton[];
  /** Contenido HTML personalizado (opcional) */
  htmlContent?: string;
}

export interface PopupItem extends PopupConfig {
  id: number;
  closing?: boolean;
}

/**
 * Servicio global para mostrar popups/modales dinámicos.
 * Inyectable en root para que sea singleton en toda la aplicación.
 * 
 * @example
 * ```typescript
 * export class MyComponent {
 *   private popup = inject(PopupService);
 * 
 *   showInfo() {
 *     this.popup.info('Información', 'Este es un mensaje informativo');
 *   }
 * 
 *   showConfirm() {
 *     this.popup.confirm({
 *       title: '¿Eliminar?',
 *       message: '¿Estás seguro de eliminar este elemento?',
 *       onConfirm: () => this.delete(),
 *       onCancel: () => {}
 *     });
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private popupId = 0;

  /** Signal público para que el componente lea los popups */
  readonly popups = signal<PopupItem[]>([]);

  /**
   * Muestra un popup con la configuración especificada.
   */
  show(config: PopupConfig): number {
    const id = ++this.popupId;
    const popup: PopupItem = {
      ...config,
      id,
      type: config.type ?? 'info',
      size: config.size ?? 'md',
      closable: config.closable ?? true,
      closeOnBackdrop: config.closeOnBackdrop ?? true
    };

    this.popups.update(p => [...p, popup]);
    return id;
  }

  /** Popup informativo simple */
  info(title: string, message: string): number {
    let id = 0;
    id = this.show({
      title,
      message,
      type: 'info',
      icon: 'fa-solid fa-circle-info',
      buttons: [{ label: 'Aceptar', variant: 'primary', action: () => this.close(id) }]
    });
    return id;
  }

  /** Popup de éxito */
  success(title: string, message: string): number {
    let id = 0;
    id = this.show({
      title,
      message,
      type: 'success',
      icon: 'fa-solid fa-circle-check',
      buttons: [{ label: 'Aceptar', variant: 'primary', action: () => this.close(id) }]
    });
    return id;
  }

  /** Popup de advertencia */
  warning(title: string, message: string): number {
    let id = 0;
    id = this.show({
      title,
      message,
      type: 'warning',
      icon: 'fa-solid fa-triangle-exclamation',
      buttons: [{ label: 'Entendido', variant: 'primary', action: () => this.close(id) }]
    });
    return id;
  }

  /** Popup de error */
  error(title: string, message: string): number {
    let id = 0;
    id = this.show({
      title,
      message,
      type: 'error',
      icon: 'fa-solid fa-circle-xmark',
      buttons: [{ label: 'Cerrar', variant: 'danger', action: () => this.close(id) }]
    });
    return id;
  }

  /** Popup de confirmación con acciones */
  confirm(options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }): number {
    let id = 0;
    id = this.show({
      title: options.title,
      message: options.message,
      type: 'confirm',
      icon: 'fa-solid fa-question-circle',
      closeOnBackdrop: false,
      buttons: [
        {
          label: options.cancelLabel ?? 'Cancelar',
          variant: 'ghost',
          action: () => { options.onCancel?.(); this.close(id); }
        },
        {
          label: options.confirmLabel ?? 'Confirmar',
          variant: 'primary',
          action: () => { options.onConfirm(); this.close(id); }
        }
      ]
    });
    return id;
  }

  /**
   * Cierra un popup específico por ID.
   */
  close(id: number): void {
    this.popups.update(p =>
      p.map(popup => popup.id === id ? { ...popup, closing: true } : popup)
    );
    setTimeout(() => {
      this.popups.update(p => p.filter(popup => popup.id !== id));
    }, 200);
  }

  /** Cierra todos los popups */
  clear(): void {
    this.popups.set([]);
  }
}
