using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Pacientes.Comandos.ActualizarPaciente;

public sealed record ActualizarPacienteVM(
    int Id,
    string Nombres,
    string Apellidos,
    string NumeroDocumento,
    string Telefono,
    string Correo,
    DateTime FechaNacimiento,
    string? Genero,
    string? Direccion) : IRequest<IOutcome<bool>>;
