using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Autenticacion.Comun;
using Aplicacion.CasosUso.Autenticacion.Puertos;
using MediatR;

namespace Aplicacion.CasosUso.Autenticacion.Consultas.ObtenerPerfil;

internal sealed class ObtenerPerfilConsultaManejador
    : IRequestHandler<ObtenerPerfilConsulta, ResultadoCitaMedica<PerfilUsuarioRespuesta>>
{
    private readonly IRepositorioUsuarios _repositorioUsuarios;

    public ObtenerPerfilConsultaManejador(IRepositorioUsuarios repositorioUsuarios)
    {
        _repositorioUsuarios = repositorioUsuarios;
    }

    public async Task<ResultadoCitaMedica<PerfilUsuarioRespuesta>> Handle(
        ObtenerPerfilConsulta solicitud, CancellationToken ct)
    {
        var usuario = await _repositorioUsuarios.ObtenerPorIdAsync(solicitud.IdUsuario, ct);
        if (usuario is null)
            return new ExitoCitaMedica<PerfilUsuarioRespuesta> { StatusCode = 404, DetalleErrorCitaMedica = new ErrorCitaMedica("404", "Usuario no encontrado") };

        return new ExitoCitaMedica<PerfilUsuarioRespuesta>(new PerfilUsuarioRespuesta(
                usuario.Id,
                usuario.NombreUsuario,
                usuario.NombreCompleto,
                usuario.Correo,
                usuario.BActivo));
    }
}



