using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Pacientes.Comandos.RegistrarPaciente;

public sealed record RegistrarPacienteVM(
    string Nombres,
    string Apellidos,
    string NumeroDocumento,
    string Telefono,
    string Correo,
    DateTime FechaNacimiento,
    string? Genero,
    string? Direccion) : IRequest<IOutcome<int>>;
