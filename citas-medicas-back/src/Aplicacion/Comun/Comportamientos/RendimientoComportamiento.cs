using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using Aplicacion.Comun.Interfaces;

namespace Aplicacion.Comun.Comportamientos;

public sealed class RendimientoComportamiento<TSolicitud, TRespuesta>
    : IPipelineBehavior<TSolicitud, TRespuesta>
    where TSolicitud : IRequest<TRespuesta>
{
    private readonly Stopwatch _cronometro = new();
    private readonly ILogger<RendimientoComportamiento<TSolicitud, TRespuesta>> _logger;
    private readonly IServicioUsuarioActual _servicioUsuario;

    public RendimientoComportamiento(
        ILogger<RendimientoComportamiento<TSolicitud, TRespuesta>> logger,
        IServicioUsuarioActual servicioUsuario)
    {
        _logger = logger;
        _servicioUsuario = servicioUsuario;
    }

    public async Task<TRespuesta> Handle(
        TSolicitud solicitud,
        RequestHandlerDelegate<TRespuesta> siguiente,
        CancellationToken cancellationToken)
    {
        _cronometro.Restart();
        var respuesta = await siguiente();
        _cronometro.Stop();

        var milisegundos = _cronometro.ElapsedMilliseconds;
        if (milisegundos > 500)
        {
            _logger.LogWarning(
                "Solicitud lenta: {NombreSolicitud} ({Milisegundos} ms) Usuario: {IdUsuario}",
                typeof(TSolicitud).Name, milisegundos, _servicioUsuario.IdUsuario);
        }

        return respuesta;
    }
}
