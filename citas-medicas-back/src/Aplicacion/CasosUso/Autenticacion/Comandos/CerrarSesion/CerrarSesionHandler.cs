using Aplicacion.Comun.Modelos;
using Aplicacion.Comun.Interfaces;
using Aplicacion.Comun.Interfaces.Seguridad;
using Aplicacion.CasosUso.Autenticacion.Comun;
using MediatR;
using System.IdentityModel.Tokens.Jwt;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.CerrarSesion;

internal sealed class CerrarSesionVMHandler
    : IRequestHandler<CerrarSesionVM, IOutcome<bool>>
{
    private readonly IListaNegraTokens _listaNegra;
    private readonly IServicioTokenRefresco _servicioTokenRefresco;
    private readonly IServicioUsuarioActual _servicioUsuario;

    public CerrarSesionVMHandler(
        IListaNegraTokens listaNegra,
        IServicioTokenRefresco servicioTokenRefresco,
        IServicioUsuarioActual servicioUsuario)
    {
        _listaNegra = listaNegra;
        _servicioTokenRefresco = servicioTokenRefresco;
        _servicioUsuario = servicioUsuario;
    }

    public async Task<IOutcome<bool>> Handle(
        CerrarSesionVM solicitud, CancellationToken ct)
    {
        var handler = new JwtSecurityTokenHandler();
        if (!handler.CanReadToken(solicitud.TokenAcceso))
            return new SuccessResult<bool> { StatusCode = 400, detailError = new DetailError("400", "Token invalido") };

        var jwt = handler.ReadJwtToken(solicitud.TokenAcceso);
        var jti = jwt.Id;
        var exp = jwt.ValidTo;

        if (!string.IsNullOrEmpty(jti))
            await _listaNegra.AgregarAsync(jti, exp, ct);

        if (int.TryParse(_servicioUsuario.IdUsuario, out var idUsuario))
            await _servicioTokenRefresco.RevocarTodosDelUsuarioAsync(idUsuario, ct);

        return new SuccessResult<bool>(true);
    }
}
