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

internal sealed class RenovarTokenComandoHandler
    : IRequestHandler<RenovarTokenComando, ResultadoCitaMedica<RenovarTokenRespuesta>>
{
    private readonly IServicioTokenRefresco _servicioTokenRefresco;
    private readonly IRepositorioUsuarios _repositorioUsuarios;
    private readonly IConfiguracionJwt _configJwt;
    private readonly IServicioTokenJwt _servicioTokenJwt;
    private readonly ConfiguracionSeguridad _configSeguridad;

    public RenovarTokenComandoHandler(
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

    public async Task<ResultadoCitaMedica<RenovarTokenRespuesta>> Handle(
        RenovarTokenComando solicitud, CancellationToken ct)
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
            return new ExitoCitaMedica<RenovarTokenRespuesta> { StatusCode = 401, DetalleErrorCitaMedica = new ErrorCitaMedica("401", "Token invalido") };
        }

        var jtiClaim = principal.FindFirst(JwtRegisteredClaimNames.Jti);
        if (jtiClaim is null)
            return new ExitoCitaMedica<RenovarTokenRespuesta> { StatusCode = 401, DetalleErrorCitaMedica = new ErrorCitaMedica("401", "Token invalido") };

        var tokenRefrescoAlmacenado = await _servicioTokenRefresco.ObtenerPorTokenAsync(solicitud.TokenRefresco, ct);

        if (tokenRefrescoAlmacenado is null)
            return new ExitoCitaMedica<RenovarTokenRespuesta> { StatusCode = 401, DetalleErrorCitaMedica = new ErrorCitaMedica("401", "Token invalido") };

        if (tokenRefrescoAlmacenado.BUsado)
            return new ExitoCitaMedica<RenovarTokenRespuesta> { StatusCode = 401, DetalleErrorCitaMedica = new ErrorCitaMedica("401", "Token ya usado") };

        if (tokenRefrescoAlmacenado.BRevocado)
            return new ExitoCitaMedica<RenovarTokenRespuesta> { StatusCode = 401, DetalleErrorCitaMedica = new ErrorCitaMedica("401", "Token revocado") };

        if (tokenRefrescoAlmacenado.FechaExpiracion < DateTime.UtcNow)
            return new ExitoCitaMedica<RenovarTokenRespuesta> { StatusCode = 401, DetalleErrorCitaMedica = new ErrorCitaMedica("401", "Token expirado") };

        if (tokenRefrescoAlmacenado.IdJwt != jtiClaim.Value)
            return new ExitoCitaMedica<RenovarTokenRespuesta> { StatusCode = 401, DetalleErrorCitaMedica = new ErrorCitaMedica("401", "Token invalido") };

        var usuario = await _repositorioUsuarios.ObtenerPorIdAsync(tokenRefrescoAlmacenado.IdUsuario, ct);
        if (usuario is null || !usuario.BActivo)
            return new ExitoCitaMedica<RenovarTokenRespuesta> { StatusCode = 401, DetalleErrorCitaMedica = new ErrorCitaMedica("401", "Usuario inactivo") };

        var nuevoJwtId = Guid.NewGuid().ToString();
        var expiraEn = DateTime.UtcNow.AddMinutes(_configSeguridad.ExpiracionJwtMinutos);

        var nuevoTokenAcceso = _servicioTokenJwt.GenerarTokenAcceso(usuario.Id, usuario.NombreUsuario, nuevoJwtId, expiraEn);
        var nuevoTokenRefresco = await _servicioTokenRefresco.GenerarAsync(usuario.Id, nuevoJwtId, null, null, ct);

        await _servicioTokenRefresco.MarcarUsadoAsync(tokenRefrescoAlmacenado.Id, nuevoTokenRefresco.Id, ct);

        return new ExitoCitaMedica<RenovarTokenRespuesta>(new RenovarTokenRespuesta(nuevoTokenAcceso, nuevoTokenRefresco.Token, expiraEn));
    }
}


