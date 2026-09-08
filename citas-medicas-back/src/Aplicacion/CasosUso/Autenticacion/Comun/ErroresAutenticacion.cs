using FluentValidation.Results;

namespace Aplicacion.CasosUso.Autenticacion.Comun;

public static class ErroresAutenticacion
{
    public static ErrorAutenticacion CredencialesInvalidas() => new(
        CodigoErrorAutenticacion.CredencialesInvalidas,
        "Credenciales invalidas",
        "El usuario o la contrasena son incorrectos.");

    public static ErrorAutenticacion UsuarioInactivo() => new(
        CodigoErrorAutenticacion.UsuarioInactivo,
        "Usuario inactivo",
        "La cuenta de usuario esta desactivada.");

    public static ErrorAutenticacion CuentaBloqueada() => new(
        CodigoErrorAutenticacion.CuentaBloqueada,
        "Cuenta bloqueada",
        "La cuenta ha sido bloqueada temporalmente por exceder el limite de intentos.");

    public static ErrorAutenticacion TokenInvalido() => new(
        CodigoErrorAutenticacion.TokenInvalido,
        "Token invalido",
        "El token proporcionado no es valido.");

    public static ErrorAutenticacion TokenExpirado() => new(
        CodigoErrorAutenticacion.TokenExpirado,
        "Token expirado",
        "El token ha expirado.");

    public static ErrorAutenticacion TokenRevocado() => new(
        CodigoErrorAutenticacion.TokenRevocado,
        "Token revocado",
        "El token ha sido revocado.");

    public static ErrorAutenticacion TokenYaUsado() => new(
        CodigoErrorAutenticacion.TokenYaUsado,
        "Token ya usado",
        "El token de refresco ya fue utilizado.");

    public static ErrorAutenticacion UsuarioNoEncontrado() => new(
        CodigoErrorAutenticacion.UsuarioNoEncontrado,
        "Usuario no encontrado",
        "No se encontro el usuario.");

    public static ErrorAutenticacion Validacion(IReadOnlyList<ValidationFailure> errores) => new(
        CodigoErrorAutenticacion.ValidacionFallida,
        "Error de validacion",
        string.Join("; ", errores.Select(e => e.ErrorMessage)));
}
