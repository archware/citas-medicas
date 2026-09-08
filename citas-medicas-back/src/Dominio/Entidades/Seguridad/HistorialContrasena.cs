namespace Dominio.Entidades.Seguridad;

public sealed class HistorialContrasena
{
    public int Id { get; set; }
    public int IdUsuario { get; set; }
    public string HashContrasena { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
}
