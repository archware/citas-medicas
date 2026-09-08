namespace Aplicacion.Comun.Interfaces.Seguridad;

public interface IListaNegraTokens
{
    Task AgregarAsync(string idJwt, DateTime expiracion, CancellationToken ct = default);
    Task<bool> EstaEnListaNegraAsync(string idJwt, CancellationToken ct = default);
}
