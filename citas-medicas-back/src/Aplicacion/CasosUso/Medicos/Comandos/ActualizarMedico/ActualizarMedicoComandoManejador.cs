using Aplicacion.CasosUso.Medicos.Puertos;
using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Comandos.ActualizarMedico;

internal sealed class ActualizarMedicoComandoManejador : IRequestHandler<ActualizarMedicoComando, ResultadoCitaMedica<bool>>
{
    private readonly IRepositorioMedicos _repositorio;

    public ActualizarMedicoComandoManejador(IRepositorioMedicos repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<ResultadoCitaMedica<bool>> Handle(ActualizarMedicoComando solicitud, CancellationToken ct)
    {
        var medico = await _repositorio.ObtenerPorIdAsync(solicitud.Id, ct);
        if (medico == null)
            return new ErrorCitaMedica<bool>("Medico no encontrado") { StatusCode = 404 };

        medico.Nombres = solicitud.Nombres;
        medico.Apellidos = solicitud.Apellidos;
        medico.NumeroColegiatura = solicitud.NumeroColegiatura;
        medico.Especialidad = solicitud.Especialidad;
        medico.Telefono = solicitud.Telefono;
        medico.Correo = solicitud.Correo;

        await _repositorio.ActualizarAsync(medico, ct);
        return new ExitoCitaMedica<bool>(true);
    }
}

