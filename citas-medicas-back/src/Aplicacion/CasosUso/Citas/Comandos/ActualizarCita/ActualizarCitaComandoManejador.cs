using Aplicacion.CasosUso.Citas.Puertos;
using Aplicacion.Comun.Modelos;
using Dominio.Citas;
using MediatR;

namespace Aplicacion.CasosUso.Citas.Comandos.ActualizarCita;

internal sealed class ActualizarCitaComandoManejador : IRequestHandler<ActualizarCitaComando, ResultadoCitaMedica<bool>>
{
    private readonly IRepositorioCitas _repositorio;

    public ActualizarCitaComandoManejador(IRepositorioCitas repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<ResultadoCitaMedica<bool>> Handle(ActualizarCitaComando comando, CancellationToken ct)
    {
        var cita = await _repositorio.ObtenerPorIdAsync(comando.Id, ct);
        if (cita == null)
            return new ErrorCitaMedica<bool>("Cita no encontrada") { StatusCode = 404 };

        if (cita.FechaHora != comando.FechaHora)
        {
            bool choque = await _repositorio.VerificarChoqueHorarioAsync(cita.IdMedico, comando.FechaHora, ct);
            if (choque)
                return new ErrorCitaMedica<bool>("El medico ya tiene una cita asignada en ese rango horario.") { StatusCode = 409 };
        }

        cita.Actualizar(comando.FechaHora, comando.Motivo, comando.Diagnostico, comando.Tratamiento);

        if (!string.IsNullOrEmpty(comando.Estado) && Enum.TryParse<EstadoCita>(comando.Estado, true, out var est))
        {
            cita.CambiarEstado(est);
        }
        
        await _repositorio.ActualizarAsync(cita, ct);
        return new ExitoCitaMedica<bool>(true);
    }
}

