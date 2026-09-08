using MediatR;
using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Pacientes.Puertos;
using Dominio.Entidades;

namespace Aplicacion.CasosUso.Pacientes.Comandos.RegistrarPaciente;

internal sealed class RegistrarPacienteHandler : IRequestHandler<RegistrarPacienteVM, IOutcome<int>>
{
    private readonly IRepositorioPacientes _repositorioPacientes;

    public RegistrarPacienteHandler(IRepositorioPacientes repositorioPacientes)
    {
        _repositorioPacientes = repositorioPacientes;
    }

    public async Task<IOutcome<int>> Handle(RegistrarPacienteVM solicitud, CancellationToken ct)
    {
        var paciente = Paciente.Registrar(
            solicitud.Nombres,
            solicitud.Apellidos,
            solicitud.NumeroDocumento,
            solicitud.Telefono,
            solicitud.Correo,
            solicitud.FechaNacimiento,
            solicitud.Genero,
            solicitud.Direccion
        );

        var id = await _repositorioPacientes.CrearAsync(paciente, ct);
        return new SuccessResult<int>(id) { StatusCode = 201 };
    }
}
