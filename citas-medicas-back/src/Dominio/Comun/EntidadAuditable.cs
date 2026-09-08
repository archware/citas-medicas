namespace Dominio.Comun;

public abstract class EntidadAuditable : EntidadBase
{
    public DateTime? DFechaRegistro { get; set; }
    public string? VUsuarioRegistro { get; set; }
    public DateTime? DFechaModificacion { get; set; }
    public string? VUsuarioModificacion { get; set; }
}
