using Aplicacion.CasosUso.Pacientes.Comandos.CrearPaciente;
using Aplicacion.CasosUso.Pacientes.Comandos.ActualizarPaciente;
using Aplicacion.CasosUso.Pacientes.Comandos.EliminarPaciente;
using Aplicacion.CasosUso.Pacientes.Consultas.ObtenerPacientes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CITAMEDICA.Controladores;

[Route("api/v1/plataforma/pacientes")]
[Authorize]
public sealed class PacientesController : ControladorBase
{
    [HttpGet]
    [Produces("application/json")]
    public async Task<IActionResult> ObtenerTodos([FromQuery] ObtenerPacientesConsulta consulta)
    {
        var r = await Mediator.Send(consulta);
        return StatusCode(r.StatusCode, r);
    }

    [HttpPost]
    [Produces("application/json")]
    public async Task<IActionResult> Crear([FromBody] CrearPacienteComando comando)
    {
        var r = await Mediator.Send(comando);
        return StatusCode(r.StatusCode, r);
    }

    [HttpPut("{id:int}")]
    [Produces("application/json")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ActualizarPacienteComando comando)
    {
        if (id != comando.Id) return BadRequest();
        var r = await Mediator.Send(comando);
        return StatusCode(r.StatusCode, r);
    }

    [HttpDelete("{id:int}")]
    [Produces("application/json")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var r = await Mediator.Send(new EliminarPacienteComando(id));
        return StatusCode(r.StatusCode, r);
    }
}


