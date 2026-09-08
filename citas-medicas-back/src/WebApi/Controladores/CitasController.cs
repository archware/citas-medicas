using Aplicacion.CasosUso.Citas.Comandos.RegistrarCita;
using Aplicacion.CasosUso.Citas.Comandos.ActualizarCita;
using Aplicacion.CasosUso.Citas.Comandos.CancelarCita;
using Aplicacion.CasosUso.Citas.Consultas.ObtenerCitas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controladores;

[Route("api/v1/plataforma/[controller]")]
[Authorize]
public sealed class CitasController : ControladorBase
{
    [HttpGet]
    [Produces("application/json")]
    public async Task<IActionResult> Obtener([FromQuery] ObtenerCitasVM consulta)
    {
        var r = await Mediator.Send(consulta);
        return StatusCode(r.StatusCode, r);
    }

    [HttpPost]
    [Produces("application/json")]
    public async Task<IActionResult> Registrar([FromBody] RegistrarCitaVM comando)
    {
        var r = await Mediator.Send(comando);
        return StatusCode(r.StatusCode, r);
    }

    [HttpPut("{id:int}")]
    [Produces("application/json")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarCitaVM comando)
    {
        if (id != comando.Id) return BadRequest();
        var r = await Mediator.Send(comando);
        return StatusCode(r.StatusCode, r);
    }

    [HttpPatch("{id:int}/cancelar")]
    [Produces("application/json")]
    public async Task<IActionResult> Cancelar(int id)
    {
        var r = await Mediator.Send(new CancelarCitaVM(id));
        return StatusCode(r.StatusCode, r);
    }
}
