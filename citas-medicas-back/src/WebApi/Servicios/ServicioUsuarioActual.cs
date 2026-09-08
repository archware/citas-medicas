using System.Security.Claims;
using Aplicacion.Comun.Interfaces;

namespace WebApi.Servicios;

public sealed class ServicioUsuarioActual : IServicioUsuarioActual
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ServicioUsuarioActual(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? IdUsuario =>
        _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("sub");

    public string? TokenAcceso =>
        _httpContextAccessor.HttpContext?.Request.Headers["Authorization"]
            .FirstOrDefault()?.Replace("Bearer ", string.Empty);
}
