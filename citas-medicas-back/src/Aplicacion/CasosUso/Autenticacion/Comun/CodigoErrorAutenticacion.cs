namespace Aplicacion.CasosUso.Autenticacion.Comun;

public enum CodigoErrorAutenticacion
{
    Ninguno = 0,
    CredencialesInvalidas,
    UsuarioInactivo,
    CuentaBloqueada,
    TokenInvalido,
    TokenExpirado,
    TokenRevocado,
    TokenYaUsado,
    ValidacionFallida,
    UsuarioNoEncontrado
}
