using Dominio.Comun;

namespace Dominio.Medicos;

public sealed class Medico : EntidadAuditable
{
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string NumeroColegiatura { get; set; } = string.Empty;
    public string Especialidad { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Correo { get; set; }
    public bool BActivo { get; set; } = true;
}
