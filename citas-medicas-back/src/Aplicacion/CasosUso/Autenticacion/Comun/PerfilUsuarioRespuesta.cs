namespace Aplicacion.CasosUso.Autenticacion.Comun;

public sealed record PerfilUsuarioRespuesta(
    int Id,
    string NombreUsuario,
    string? NombreCompleto,
    string? Correo,
    bool Activo);
