/**
 * Contratos de autenticaciÃ³n de la CONSOLA DEL DUEÃ‘O (identidad de plataforma).
 * El backend responde SIEMPRE 200 en el login: con tokens, con `mfaRequired`
 * (falta el cÃ³digo), con `mfaSetupRequired` (MFA obligatorio aÃºn no enrolado: llega
 * un token de ARRANQUE que solo sirve para activarlo) o con `detalleErrorCitaMedica`.
 */

/** SesiÃ³n completa emitida por POST /api/v1/plataforma/auth/login. */
export interface LoginSuccess {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt?: string;
  username?: string;
  /** Siempre 'plataforma' en la sesiÃ³n completa. */
  scope?: string;
}

/** El administrador tiene MFA activo y falta el cÃ³digo. */
export interface LoginMfaRequired {
  mfaRequired: true;
}

/** MFA obligatorio aÃºn no enrolado: token de arranque (scope plataforma.setup). */
export interface LoginMfaSetupRequired {
  mfaSetupRequired: true;
  setupToken: string;
  username?: string;
}

export interface LogindetalleErrorCitaMedica {
  detalleErrorCitaMedica: { errorCode: string; message: string };
}

export type LoginResult = LoginSuccess | LoginMfaRequired | LoginMfaSetupRequired | LogindetalleErrorCitaMedica;

export function isMfaRequired(result: LoginResult): result is LoginMfaRequired {
  return (result as LoginMfaRequired).mfaRequired === true;
}

export function isMfaSetupRequired(result: LoginResult): result is LoginMfaSetupRequired {
  const r = result as LoginMfaSetupRequired;
  return r.mfaSetupRequired === true && typeof r.setupToken === 'string' && r.setupToken.length > 0;
}

export function isdetalleErrorCitaMedica(result: LoginResult): result is LogindetalleErrorCitaMedica {
  return typeof (result as LogindetalleErrorCitaMedica).detalleErrorCitaMedica === 'object' && (result as LogindetalleErrorCitaMedica).detalleErrorCitaMedica !== null;
}

export function isLoginSuccess(result: LoginResult): result is LoginSuccess {
  const token = (result as LoginSuccess).accessToken;
  return typeof token === 'string' && token.length > 0;
}

/** Cuerpo del login (PascalCase: asÃ­ lo lee el backend). */
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

/** Lo que se persiste en el navegador (la sesiÃ³n completa; nunca el token de arranque). */
export interface Session {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  username?: string;
}

