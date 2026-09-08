namespace Dominio.Entidades.Seguridad;

public sealed class TokenRefresco
{
    public int Id { get; set; }
    public int IdUsuario { get; set; }
    public string Token { get; set; } = string.Empty;
    public string IdJwt { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime FechaExpiracion { get; set; }
    public bool BUsado { get; set; }
    public bool BRevocado { get; set; }
    public DateTime? FechaRevocacion { get; set; }
    public string? IpCreacion { get; set; }
    public string? AgenteUsuario { get; set; }
    public int? IdTokenReemplazo { get; set; }
}
