using Dominio.Comun;

namespace Dominio.Entidades.Seguridad;

public sealed class Usuario : EntidadAuditable
{
    public string NombreUsuario { get; set; } = string.Empty;
    public string HashContrasena { get; set; } = string.Empty;
    public bool BActivo { get; set; } = true;
    public string? Correo { get; set; }
    public string? NombreCompleto { get; set; }
}
