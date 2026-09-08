using Aplicacion.CasosUso.Autenticacion.Comandos.CerrarSesion;
using Aplicacion.CasosUso.Autenticacion.Comandos.IniciarSesion;
using Aplicacion.CasosUso.Autenticacion.Comandos.RenovarToken;
using Aplicacion.CasosUso.Autenticacion.Consultas.ObtenerPerfil;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controladores;

[Route("api/v1/plataforma/auth")]
public sealed class AutenticacionController : ControladorBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    [Produces("application/json")]
    public async Task<IActionResult> IniciarSesion([FromBody] IniciarSesionVM comando)
    {
        var r = await Mediator.Send(comando);
        return StatusCode(r.StatusCode, r);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [Produces("application/json")]
    public async Task<IActionResult> RenovarToken([FromBody] RenovarTokenVM comando)
    {
        var r = await Mediator.Send(comando);
        return StatusCode(r.StatusCode, r);
    }

    [HttpPost("logout")]
    [Authorize]
    [Produces("application/json")]
    public async Task<IActionResult> CerrarSesion()
    {
        var token = HttpContext.Request.Headers["Authorization"]
            .FirstOrDefault()?.Replace("Bearer ", string.Empty) ?? string.Empty;
        var r = await Mediator.Send(new CerrarSesionVM(token));
        return StatusCode(r.StatusCode, r);
    }

    [HttpGet("perfil")]
    [Authorize]
    [Produces("application/json")]
    public async Task<IActionResult> ObtenerPerfil()
    {
        var idUsuario = int.Parse(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? "0");
        var r = await Mediator.Send(new ObtenerPerfilVM(idUsuario));
        return StatusCode(r.StatusCode, r);
    }
}
