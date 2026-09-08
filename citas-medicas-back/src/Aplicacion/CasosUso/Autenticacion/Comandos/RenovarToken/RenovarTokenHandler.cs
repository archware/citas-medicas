using Aplicacion.Comun.Modelos;
using Aplicacion.Comun.Interfaces.Configuracion;
using Aplicacion.Comun.Interfaces.Seguridad;
using Aplicacion.Comun.Modelos.Configuracion;
using Aplicacion.CasosUso.Autenticacion.Comun;
using Aplicacion.CasosUso.Autenticacion.Puertos;
using MediatR;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.RenovarToken;

internal sealed class RenovarTokenVMHandler
    : IRequestHandler<RenovarTokenVM, IOutcome<RenovarTokenRespuesta>>
{
    private readonly IServicioTokenRefresco _servicioTokenRefresco;
    private readonly IRepositorioUsuarios _repositorioUsuarios;
    private readonly IConfiguracionJwt _configJwt;
    private readonly IServicioTokenJwt _servicioTokenJwt;
    private readonly ConfiguracionSeguridad _configSeguridad;

    public RenovarTokenVMHandler(
        IServicioTokenRefresco servicioTokenRefresco,
        IRepositorioUsuarios repositorioUsuarios,
        IConfiguracionJwt configJwt,
        IServicioTokenJwt servicioTokenJwt,
        ConfiguracionSeguridad configSeguridad)
    {
        _servicioTokenRefresco = servicioTokenRefresco;
        _repositorioUsuarios = repositorioUsuarios;
        _configJwt = configJwt;
        _servicioTokenJwt = servicioTokenJwt;
        _configSeguridad = configSeguridad;
    }

    public async Task<IOutcome<RenovarTokenRespuesta>> Handle(
        RenovarTokenVM solicitud, CancellationToken ct)
    {
        var handler = new JwtSecurityTokenHandler();

        var parametros = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configJwt.Key)),
            ValidateIssuer = true,
            ValidIssuer = _configJwt.Issuer,
            ValidateAudience = true,
            ValidAudience = _configJwt.Audience,
            ValidateLifetime = false,
            ClockSkew = TimeSpan.Zero
        };

        ClaimsPrincipal principal;
        try
        {
            principal = handler.ValidateToken(solicitud.TokenAcceso, parametros, out _);
        }
        catch
        {
            return new SuccessResult<RenovarTokenRespuesta> { StatusCode = 401, detailError = new DetailError("401", "Token invalido") };
        }

        var jtiClaim = principal.FindFirst(JwtRegisteredClaimNames.Jti);
        if (jtiClaim is null)
            return new SuccessResult<RenovarTokenRespuesta> { StatusCode = 401, detailError = new DetailError("401", "Token invalido") };

        var tokenRefrescoAlmacenado = await _servicioTokenRefresco.ObtenerPorTokenAsync(solicitud.TokenRefresco, ct);

        if (tokenRefrescoAlmacenado is null)
            return new SuccessResult<RenovarTokenRespuesta> { StatusCode = 401, detailError = new DetailError("401", "Token invalido") };

        if (tokenRefrescoAlmacenado.BUsado)
            return new SuccessResult<RenovarTokenRespuesta> { StatusCode = 401, detailError = new DetailError("401", "Token ya usado") };

        if (tokenRefrescoAlmacenado.BRevocado)
            return new SuccessResult<RenovarTokenRespuesta> { StatusCode = 401, detailError = new DetailError("401", "Token revocado") };

        if (tokenRefrescoAlmacenado.FechaExpiracion < DateTime.UtcNow)
            return new SuccessResult<RenovarTokenRespuesta> { StatusCode = 401, detailError = new DetailError("401", "Token expirado") };

        if (tokenRefrescoAlmacenado.IdJwt != jtiClaim.Value)
            return new SuccessResult<RenovarTokenRespuesta> { StatusCode = 401, detailError = new DetailError("401", "Token invalido") };

        var usuario = await _repositorioUsuarios.ObtenerPorIdAsync(tokenRefrescoAlmacenado.IdUsuario, ct);
        if (usuario is null || !usuario.BActivo)
            return new SuccessResult<RenovarTokenRespuesta> { StatusCode = 401, detailError = new DetailError("401", "Usuario inactivo") };

        var nuevoJwtId = Guid.NewGuid().ToString();
        var expiraEn = DateTime.UtcNow.AddMinutes(_configSeguridad.ExpiracionJwtMinutos);

        var nuevoTokenAcceso = _servicioTokenJwt.GenerarTokenAcceso(usuario.Id, usuario.NombreUsuario, nuevoJwtId, expiraEn);
        var nuevoTokenRefresco = await _servicioTokenRefresco.GenerarAsync(usuario.Id, nuevoJwtId, null, null, ct);

        await _servicioTokenRefresco.MarcarUsadoAsync(tokenRefrescoAlmacenado.Id, nuevoTokenRefresco.Id, ct);

        return new SuccessResult<RenovarTokenRespuesta>(new RenovarTokenRespuesta(nuevoTokenAcceso, nuevoTokenRefresco.Token, expiraEn));
    }
}
