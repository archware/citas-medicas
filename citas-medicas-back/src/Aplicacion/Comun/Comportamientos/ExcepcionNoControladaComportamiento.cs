using MediatR;
using Microsoft.Extensions.Logging;

namespace Aplicacion.Comun.Comportamientos;

public sealed class ExcepcionNoControladaComportamiento<TSolicitud, TRespuesta>
    : IPipelineBehavior<TSolicitud, TRespuesta>
    where TSolicitud : IRequest<TRespuesta>
{
    private readonly ILogger<ExcepcionNoControladaComportamiento<TSolicitud, TRespuesta>> _logger;

    public ExcepcionNoControladaComportamiento(
        ILogger<ExcepcionNoControladaComportamiento<TSolicitud, TRespuesta>> logger)
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
        catch (Exception ex)
        {
            var nombreSolicitud = typeof(TSolicitud).Name;
            _logger.LogError(ex,
                "Excepcion no controlada para la solicitud {NombreSolicitud} {@Solicitud}",
                nombreSolicitud, solicitud);
            throw;
        }
    }
}
