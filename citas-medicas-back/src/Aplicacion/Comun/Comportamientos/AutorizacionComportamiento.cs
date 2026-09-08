using System.Reflection;
using MediatR;
using Aplicacion.Comun.Atributos;
using Aplicacion.Comun.Excepciones;
using Aplicacion.Comun.Interfaces;

namespace Aplicacion.Comun.Comportamientos;

public sealed class AutorizacionComportamiento<TSolicitud, TRespuesta>
    : IPipelineBehavior<TSolicitud, TRespuesta>
    where TSolicitud : IRequest<TRespuesta>
{
    private readonly IServicioUsuarioActual _servicioUsuario;

    public AutorizacionComportamiento(IServicioUsuarioActual servicioUsuario)
    {
        _servicioUsuario = servicioUsuario;
    }

    public async Task<TRespuesta> Handle(
        TSolicitud solicitud,
        RequestHandlerDelegate<TRespuesta> siguiente,
        CancellationToken cancellationToken)
    {
        var esAnonima = typeof(TSolicitud)
            .GetCustomAttribute<PermitirSolicitudAnonimaAttribute>() is not null;

        if (!esAnonima && string.IsNullOrEmpty(_servicioUsuario.IdUsuario))
        {
            throw new UnauthorizedAccessException("El usuario no esta autenticado.");
        }

        return await siguiente();
    }
}
