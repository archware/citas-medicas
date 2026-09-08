/**
 * Contratos de autenticación de la CONSOLA DEL DUEÑO (identidad de plataforma).
 * El backend responde SIEMPRE 200 en el login: con tokens, con `mfaRequired`
 * (falta el código), con `mfaSetupRequired` (MFA obligatorio aún no enrolado: llega
 * un token de ARRANQUE que solo sirve para activarlo) o con `detailError`.
 */

/** Sesión completa emitida por POST /api/v1/plataforma/auth/login. */
export interface LoginSuccess {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt?: string;
  username?: string;
  /** Siempre 'plataforma' en la sesión completa. */
  scope?: string;
}

/** El administrador tiene MFA activo y falta el código. */
export interface LoginMfaRequired {
  mfaRequired: true;
}

/** MFA obligatorio aún no enrolado: token de arranque (scope plataforma.setup). */
export interface LoginMfaSetupRequired {
  mfaSetupRequired: true;
  setupToken: string;
  username?: string;
}

export interface LoginDetailError {
  detailError: { errorCode: string; message: string };
}

export type LoginResult = LoginSuccess | LoginMfaRequired | LoginMfaSetupRequired | LoginDetailError;

export function isMfaRequired(result: LoginResult): result is LoginMfaRequired {
  return (result as LoginMfaRequired).mfaRequired === true;
}

export function isMfaSetupRequired(result: LoginResult): result is LoginMfaSetupRequired {
  const r = result as LoginMfaSetupRequired;
  return r.mfaSetupRequired === true && typeof r.setupToken === 'string' && r.setupToken.length > 0;
}

export function isDetailError(result: LoginResult): result is LoginDetailError {
  return typeof (result as LoginDetailError).detailError === 'object' && (result as LoginDetailError).detailError !== null;
}

export function isLoginSuccess(result: LoginResult): result is LoginSuccess {
  const token = (result as LoginSuccess).accessToken;
  return typeof token === 'string' && token.length > 0;
}

/** Cuerpo del login (PascalCase: así lo lee el backend). */
export interface LoginRequest {
  Username: string;
  Password: string;
  MfaCode?: string;
}

export interface MfaStatus {
  enabled: boolean;
}

/** GET /api/v1/plataforma/auth/me */
export interface Perfil {
  id: string;
  username: string;
  estado: string;
  mfaHabilitado: boolean;
  createdAtUtc: string;
  ultimoLoginUtc?: string | null;
  scope: string;
}

/** Lo que se persiste en el navegador (la sesión completa; nunca el token de arranque). */
export interface Session {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  username?: string;
}
