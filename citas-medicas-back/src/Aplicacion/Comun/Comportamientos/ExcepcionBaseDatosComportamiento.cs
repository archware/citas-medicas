using MediatR;
using Microsoft.Extensions.Logging;

namespace Aplicacion.Comun.Comportamientos;

public sealed class ExcepcionBaseDatosComportamiento<TSolicitud, TRespuesta>
    : IPipelineBehavior<TSolicitud, TRespuesta>
    where TSolicitud : IRequest<TRespuesta>
{
    private readonly ILogger<ExcepcionBaseDatosComportamiento<TSolicitud, TRespuesta>> _logger;

    public ExcepcionBaseDatosComportamiento(
        ILogger<ExcepcionBaseDatosComportamiento<TSolicitud, TRespuesta>> logger)
    {
        _logger = logger;
    }

    public async Task<TRespuesta> Handle(
        TSolicitud solicitud,
        RequestHandlerDelegate<TRespuesta> siguiente,
        CancellationToken cancellationToken)
    {
        try
        {
            return await siguiente();
        }
        catch (Exception ex) when (
            ex.GetType().Name.Contains("Sql", StringComparison.OrdinalIgnoreCase) ||
            ex.GetType().Name.Contains("DbException", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogError(ex,
                "Excepcion de base de datos en solicitud {NombreSolicitud}",
                typeof(TSolicitud).Name);
            throw;
        }
    }
}
