using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Pacientes.Comandos.ActualizarPaciente;

public sealed record ActualizarPacienteComando(
    int Id,
    string Nombres,
    string Apellidos,
    string NumeroDocumento,
    string Telefono,
    string Correo,
    DateTime FechaNacimiento,
    string? Genero,
    string? Direccion) : IRequest<ResultadoCitaMedica<bool>>;

