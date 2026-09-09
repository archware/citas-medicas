using Aplicacion.CasosUso.Citas.Puertos;
using Aplicacion.Comun.Modelos;
using Dominio.Citas;
using MediatR;

namespace Aplicacion.CasosUso.Citas.Comandos.RegistrarCita;

internal sealed class RegistrarCitaComandoManejador : IRequestHandler<RegistrarCitaComando, ResultadoCitaMedica<int>>
{
    private readonly IRepositorioCitas _repositorio;

    public RegistrarCitaComandoManejador(IRepositorioCitas repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<ResultadoCitaMedica<int>> Handle(RegistrarCitaComando comando, CancellationToken ct)
    {
        bool choque = await _repositorio.VerificarChoqueHorarioAsync(comando.IdMedico, comando.FechaHora, ct);
        if (choque)
            return new ErrorCitaMedica<int>("El medico ya tiene una cita asignada en ese rango horario.") { StatusCode = 409 };

        EstadoCita estado = EstadoCita.Programada;
        if (!string.IsNullOrEmpty(comando.Estado) && Enum.TryParse<EstadoCita>(comando.Estado, true, out var est))
        {
            estado = est;
        }

        var cita = Cita.Registrar(
            comando.IdPaciente, 
            comando.IdMedico, 
            comando.FechaHora, 
            comando.Motivo, 
            comando.IdIdempotencia,
            estado,
            comando.Diagnostico,
            comando.Tratamiento);

        int id = await _repositorio.GuardarAsync(cita, ct);

        return new ExitoCitaMedica<int>(id) { StatusCode = 201 };
    }
}

