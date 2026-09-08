using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Citas.Consultas.ObtenerCitas;

public sealed record ObtenerCitasVM(int Pagina = 1, int TamanioPagina = 10, int? IdPaciente = null, int? IdMedico = null, DateTime? Fecha = null, string? Estado = null) 
    : IRequest<IOutcome<ResultadoGrilla<IEnumerable<CitaResumen>>>>;

public sealed record CitaResumen(
    int Id,
    int IdPaciente,
    string NombrePaciente,
    int IdMedico,
    string NombreMedico,
    DateTime FechaHora,
    string Motivo,
    string Estado,
    string? Diagnostico,
    string? Tratamiento);
