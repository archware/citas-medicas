using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Pacientes.Comandos.CrearPaciente;

public sealed record CrearPacienteVM(
    string Nombres,
    string Apellidos,
    string NumeroDocumento,
    string Telefono,
    string Correo,
    DateTime FechaNacimiento,
    string? Genero,
    string? Direccion
) : IRequest<ResultadoCitaMedica<int>>;

