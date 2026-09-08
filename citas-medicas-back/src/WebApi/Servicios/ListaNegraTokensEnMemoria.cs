using System.Collections.Concurrent;
using Aplicacion.Comun.Interfaces.Seguridad;

namespace WebApi.Servicios;

/// <summary>
/// Implementacion en memoria de la lista negra de tokens.
/// En produccion, reemplazar con Redis u otro almacen distribuido.
/// </summary>
public sealed class ListaNegraTokensEnMemoria : IListaNegraTokens
{
    private readonly ConcurrentDictionary<string, DateTime> _tokens = new();

    public Task AgregarAsync(string idJwt, DateTime expiracion, CancellationToken ct = default)
    {
        _tokens.TryAdd(idJwt, expiracion);
        return Task.CompletedTask;
    }

    public Task<bool> EstaEnListaNegraAsync(string idJwt, CancellationToken ct = default)
        => Task.FromResult(_tokens.ContainsKey(idJwt));
}
