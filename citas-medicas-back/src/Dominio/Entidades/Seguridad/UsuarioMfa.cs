namespace Dominio.Entidades.Seguridad;

public sealed class UsuarioMfa
{
    public int Id { get; set; }
    public int IdUsuario { get; set; }
    public string SecretoCifrado { get; set; } = string.Empty;
    public bool Habilitado { get; set; }
    public DateTime? FechaHabilitacion { get; set; }
    public string? CodigosRecuperacion { get; set; }
}
