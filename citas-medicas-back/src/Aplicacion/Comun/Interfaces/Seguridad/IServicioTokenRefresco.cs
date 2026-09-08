using Dominio.Entidades.Seguridad;

namespace Aplicacion.Comun.Interfaces.Seguridad;

public interface IServicioTokenRefresco
{
    Task<TokenRefresco> GenerarAsync(int idUsuario, string idJwt, string? ip, string? agenteUsuario, CancellationToken ct = default);
    Task<TokenRefresco?> ObtenerPorTokenAsync(string token, CancellationToken ct = default);
    Task MarcarUsadoAsync(int idToken, int? idReemplazo, CancellationToken ct = default);
    Task RevocarTodosDelUsuarioAsync(int idUsuario, CancellationToken ct = default);
}
