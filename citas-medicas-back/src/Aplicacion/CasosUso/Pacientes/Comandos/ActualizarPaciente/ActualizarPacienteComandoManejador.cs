using MediatR;
using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Pacientes.Puertos;

namespace Aplicacion.CasosUso.Pacientes.Comandos.ActualizarPaciente;

internal sealed class ActualizarPacienteComandoManejador : IRequestHandler<ActualizarPacienteComando, ResultadoCitaMedica<bool>>
{
    private readonly IRepositorioPacientes _repositorioPacientes;

    public ActualizarPacienteComandoManejador(IRepositorioPacientes repositorioPacientes)
    {
        _repositorioPacientes = repositorioPacientes;
    }

    public async Task<ResultadoCitaMedica<bool>> Handle(ActualizarPacienteComando solicitud, CancellationToken ct)
    {
        var paciente = await _repositorioPacientes.ObtenerPorIdAsync(solicitud.Id, ct);
        if (paciente == null)
            return new ErrorCitaMedica<bool>("Paciente no encontrado") { StatusCode = 404 };

        paciente.Actualizar(
            solicitud.Nombres,
            solicitud.Apellidos,
            solicitud.NumeroDocumento,
            solicitud.Telefono,
            solicitud.Correo,
            solicitud.FechaNacimiento,
            solicitud.Genero,
            solicitud.Direccion
        );

        await _repositorioPacientes.ActualizarAsync(paciente, ct);
        return new ExitoCitaMedica<bool>(true);
    }
}

