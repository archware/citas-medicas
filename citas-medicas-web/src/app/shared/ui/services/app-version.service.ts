import { Injectable, InjectionToken, inject, signal } from '@angular/core';

export interface AppVersionInfo {
  appName: string;
  version: string;
  environment: string;
  buildDate: string;
  isNative: boolean;
}

/**
 * Adaptador opcional proporcionado por cada consumidor.
 *
 * Atomic UI no detecta Tauri, Wails ni PyWebView. El runtime propietario
 * traduce sus metadatos al contrato visual común y los inyecta al arrancar.
 */
export const APP_VERSION_INFO = new InjectionToken<Partial<AppVersionInfo>>(
  'ATOMIC_APP_VERSION_INFO'
);

const DEFAULT_VERSION_INFO: AppVersionInfo = {
  appName: '',
  version: 'v1.0.0',
  environment: 'BETA',
  buildDate: '',
  isNative: false
};

@Injectable({
  providedIn: 'root'
})
export class AppVersionService {
  private readonly providedInfo = inject(APP_VERSION_INFO, { optional: true });

  readonly versionInfo = signal<AppVersionInfo>({
    ...DEFAULT_VERSION_INFO,
    ...this.providedInfo
  });

  setVersionInfo(info: Partial<AppVersionInfo>): void {
    this.versionInfo.update((current) => ({ ...current, ...info }));
  }
}
