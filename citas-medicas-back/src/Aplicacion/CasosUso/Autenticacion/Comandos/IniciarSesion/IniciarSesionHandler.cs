using Aplicacion.Comun.Modelos;
using Aplicacion.Comun.Interfaces.Configuracion;
using Aplicacion.Comun.Interfaces.Seguridad;
using Aplicacion.CasosUso.Autenticacion.Comun;
using Aplicacion.CasosUso.Autenticacion.Puertos;
using Aplicacion.Comun.Modelos.Configuracion;
using MediatR;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.IniciarSesion;

internal sealed class IniciarSesionVMHandler
    : IRequestHandler<IniciarSesionVM, IOutcome<IniciarSesionRespuesta>>
{
    private readonly IRepositorioUsuarios _repositorioUsuarios;
    private readonly IHashContrasena _hashContrasena;
    private readonly IServicioIntentosLogin _servicioIntentos;
    private readonly IServicioTokenRefresco _servicioTokenRefresco;
    private readonly IServicioTokenJwt _servicioTokenJwt;
    private readonly ConfiguracionSeguridad _configSeguridad;

    public IniciarSesionVMHandler(
        IRepositorioUsuarios repositorioUsuarios,
        IHashContrasena hashContrasena,
        IServicioIntentosLogin servicioIntentos,
        IServicioTokenRefresco servicioTokenRefresco,
        IServicioTokenJwt servicioTokenJwt,
        ConfiguracionSeguridad configSeguridad)
    {
        _repositorioUsuarios = repositorioUsuarios;
        _hashContrasena = hashContrasena;
        _servicioIntentos = servicioIntentos;
        _servicioTokenRefresco = servicioTokenRefresco;
        _servicioTokenJwt = servicioTokenJwt;
        _configSeguridad = configSeguridad;
    }

    public async Task<IOutcome<IniciarSesionRespuesta>> Handle(
        IniciarSesionVM solicitud, CancellationToken ct)
    {
        var usuario = await _repositorioUsuarios.ObtenerPorNombreUsuarioAsync(solicitud.Usuario, ct);
        if (usuario is null)
            return new SuccessResult<IniciarSesionRespuesta> { StatusCode = 401, detailError = new DetailError("401", "Credenciales inválidas") };

        if (!usuario.BActivo)
            return new SuccessResult<IniciarSesionRespuesta> { StatusCode = 403, detailError = new DetailError("403", "Usuario inactivo") };

        if (await _servicioIntentos.EstaBloquedoAsync(usuario.Id, ct))
            return new SuccessResult<IniciarSesionRespuesta> { StatusCode = 403, detailError = new DetailError("403", "Cuenta bloqueada") };

        if (!_hashContrasena.Verificar(solicitud.Clave, usuario.HashContrasena))
        {
            await _servicioIntentos.RegistrarIntentoFallidoAsync(usuario.Id, ct);
            return new SuccessResult<IniciarSesionRespuesta> { StatusCode = 401, detailError = new DetailError("401", "Credenciales inválidas") };
        }

        await _servicioIntentos.ReiniciarIntentosAsync(usuario.Id, ct);

        var jwtId = Guid.NewGuid().ToString();
        var expiraEn = DateTime.UtcNow.AddMinutes(_configSeguridad.ExpiracionJwtMinutos);
        var tokenAcceso = _servicioTokenJwt.GenerarTokenAcceso(usuario.Id, usuario.NombreUsuario, jwtId, expiraEn);

        var tokenRefresco = await _servicioTokenRefresco.GenerarAsync(
            usuario.Id, jwtId, null, null, ct);

        return new SuccessResult<IniciarSesionRespuesta>(new IniciarSesionRespuesta(tokenAcceso, tokenRefresco.Token, expiraEn));
    }
}
