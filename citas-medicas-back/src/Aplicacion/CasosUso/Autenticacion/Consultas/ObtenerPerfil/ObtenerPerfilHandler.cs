using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Autenticacion.Comun;
using Aplicacion.CasosUso.Autenticacion.Puertos;
using MediatR;

namespace Aplicacion.CasosUso.Autenticacion.Consultas.ObtenerPerfil;

internal sealed class ObtenerPerfilVMHandler
    : IRequestHandler<ObtenerPerfilVM, IOutcome<PerfilUsuarioRespuesta>>
{
    private readonly IRepositorioUsuarios _repositorioUsuarios;

    public ObtenerPerfilVMHandler(IRepositorioUsuarios repositorioUsuarios)
    {
        _repositorioUsuarios = repositorioUsuarios;
    }

    public async Task<IOutcome<PerfilUsuarioRespuesta>> Handle(
        ObtenerPerfilVM solicitud, CancellationToken ct)
    {
        var usuario = await _repositorioUsuarios.ObtenerPorIdAsync(solicitud.IdUsuario, ct);
        if (usuario is null)
            return new SuccessResult<PerfilUsuarioRespuesta> { StatusCode = 404, detailError = new DetailError("404", "Usuario no encontrado") };

        return new SuccessResult<PerfilUsuarioRespuesta>(new PerfilUsuarioRespuesta(
                usuario.Id,
                usuario.NombreUsuario,
                usuario.NombreCompleto,
                usuario.Correo,
                usuario.BActivo));
    }
}
