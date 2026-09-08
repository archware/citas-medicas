using System.Net;

namespace Aplicacion.Comun.Excepciones;

public sealed class RestExcepcion : Exception
{
    public HttpStatusCode CodigoEstado { get; }
    public object? Errores { get; }

    public RestExcepcion(HttpStatusCode codigoEstado, object? errores = null)
        : base($"Error REST: {codigoEstado}")
    {
        CodigoEstado = codigoEstado;
        Errores = errores;
    }
}
