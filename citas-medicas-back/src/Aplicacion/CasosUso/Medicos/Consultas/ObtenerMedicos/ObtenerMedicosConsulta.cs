using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Consultas.ObtenerMedicos;

public sealed record ObtenerMedicosConsulta(int Pagina = 1, int TamanioPagina = 10, string? Filtro = null)
    : IRequest<ResultadoCitaMedica<ResultadoGrilla<IEnumerable<MedicoResumen>>>>;

public sealed record MedicoResumen(
    int Id,
    string Nombres,
    string Apellidos,
    string NumeroColegiatura,
    string Especialidad,
    string? Telefono,
    string? Correo,
    bool BActivo);

