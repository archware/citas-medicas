using MediatR;
using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Pacientes.Puertos;

namespace Aplicacion.CasosUso.Pacientes.Comandos.ActualizarPaciente;

internal sealed class ActualizarPacienteHandler : IRequestHandler<ActualizarPacienteVM, IOutcome<bool>>
{
    private readonly IRepositorioPacientes _repositorioPacientes;

    public ActualizarPacienteHandler(IRepositorioPacientes repositorioPacientes)
    {
        _repositorioPacientes = repositorioPacientes;
    }

    public async Task<IOutcome<bool>> Handle(ActualizarPacienteVM solicitud, CancellationToken ct)
    {
        var paciente = await _repositorioPacientes.ObtenerPorIdAsync(solicitud.Id, ct);
        if (paciente == null)
            return new ErrorResult<bool>("Paciente no encontrado") { StatusCode = 404 };

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
        return new SuccessResult<bool>(true);
    }
}
