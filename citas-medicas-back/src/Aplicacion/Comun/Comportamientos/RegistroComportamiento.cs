using MediatR.Pipeline;
using Microsoft.Extensions.Logging;
using Aplicacion.Comun.Interfaces;

namespace Aplicacion.Comun.Comportamientos;

public sealed class RegistroComportamiento<TSolicitud>
    : IRequestPreProcessor<TSolicitud>
    where TSolicitud : notnull
{
    private readonly ILogger<RegistroComportamiento<TSolicitud>> _logger;
    private readonly IServicioUsuarioActual _servicioUsuario;

    public RegistroComportamiento(
        ILogger<RegistroComportamiento<TSolicitud>> logger,
        IServicioUsuarioActual servicioUsuario)
    {
        _logger = logger;
        _servicioUsuario = servicioUsuario;
    }

    public Task Process(TSolicitud solicitud, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Solicitud: {NombreSolicitud} Usuario: {IdUsuario} {@Solicitud}",
            typeof(TSolicitud).Name, _servicioUsuario.IdUsuario, solicitud);
        return Task.CompletedTask;
    }
}
