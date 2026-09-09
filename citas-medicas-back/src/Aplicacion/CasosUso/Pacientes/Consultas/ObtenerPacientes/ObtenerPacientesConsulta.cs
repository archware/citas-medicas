using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Pacientes.Consultas.ObtenerPacientes;

public sealed record ObtenerPacientesConsulta(
    int Pagina = 1,
    int TamanioPagina = 10,
    string? Nombre = null,
    string? Documento = null
) : IRequest<ResultadoCitaMedica<ResultadoGrilla<IEnumerable<PacienteResumen>>>>;

public sealed record PacienteResumen(
    int Id,
    string Nombres,
    string Apellidos,
    string NumeroDocumento,
    string Telefono,
    string Correo,
    DateTime FechaNacimiento
);

