/**
 * Configuración de entorno (build por defecto / desarrollo).
 *
 * En desarrollo `apiBaseUrl` queda vacío y las rutas absolutas del backend
 * (`/api/...`, `/Authentication/...`) se resuelven a través del proxy de
 * Angular (ver `proxy.conf.json`), que reenvía a http://localhost:5002.
 *
 * Para apuntar directamente al backend sin proxy, cambie `apiBaseUrl` a
 * 'http://localhost:5002' (o cree environment.production.ts con fileReplacements).
 */
export const environment = {
  production: false,
  /** Prefijo de todas las llamadas HTTP. Vacío => usa proxy en dev. */
  apiBaseUrl: '',
} as const;
