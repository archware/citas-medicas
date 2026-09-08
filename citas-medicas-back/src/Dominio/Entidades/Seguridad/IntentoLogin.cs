namespace Dominio.Entidades.Seguridad;

public sealed class IntentoLogin
{
    public int Id { get; set; }
    public int IdUsuario { get; set; }
    public int IntentosFallidos { get; set; }
    public DateTime? FinBloqueo { get; set; }
}
