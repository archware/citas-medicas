using MediatR;
using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Pacientes.Puertos;
using Dominio.Entidades;

namespace Aplicacion.CasosUso.Pacientes.Comandos.CrearPaciente;

internal sealed class CrearPacienteHandler : IRequestHandler<CrearPacienteVM, IOutcome<int>>
{
    private readonly IRepositorioPacientes _repositorio;

    public CrearPacienteHandler(IRepositorioPacientes repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<IOutcome<int>> Handle(CrearPacienteVM request, CancellationToken cancellationToken)
    {
        var paciente = Paciente.Registrar(
            request.Nombres,
            request.Apellidos,
            request.NumeroDocumento,
            request.Telefono,
            request.Correo,
            request.FechaNacimiento,
            request.Genero,
            request.Direccion);

        var id = await _repositorio.CrearAsync(paciente, cancellationToken);
        return new SuccessResult<int>(id) { StatusCode = 201 };
    }
}
