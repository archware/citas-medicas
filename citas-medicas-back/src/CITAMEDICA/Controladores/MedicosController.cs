using Aplicacion.CasosUso.Medicos.Comandos.ActualizarMedico;
using Aplicacion.CasosUso.Medicos.Comandos.EliminarMedico;
using Aplicacion.CasosUso.Medicos.Comandos.RegistrarMedico;
using Aplicacion.CasosUso.Medicos.Consultas.ObtenerMedicos;
using Microsoft.AspNetCore.Mvc;

namespace CITAMEDICA.Controladores;

[Route("api/v1/plataforma/[controller]")]
public class MedicosController : ControladorBase
{
    [HttpGet]
    public async Task<IActionResult> Obtener([FromQuery] ObtenerMedicosConsulta consulta)
    {
        var r = await Mediator.Send(consulta);
        return StatusCode(r.StatusCode, r);
    }

    [HttpPost]
    public async Task<IActionResult> Crear(RegistrarMedicoComando comando)
    {
        var r = await Mediator.Send(comando);
        return StatusCode(r.StatusCode, r);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Actualizar(int id, ActualizarMedicoComando comando)
    {
        if (id != comando.Id)
            return BadRequest("El ID de la ruta no coincide con el del cuerpo.");
        var r = await Mediator.Send(comando);
        return StatusCode(r.StatusCode, r);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var r = await Mediator.Send(new EliminarMedicoComando(id));
        return StatusCode(r.StatusCode, r);
    }
}

