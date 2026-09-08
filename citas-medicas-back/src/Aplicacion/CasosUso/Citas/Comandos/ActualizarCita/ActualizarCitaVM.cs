using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Citas.Comandos.ActualizarCita;

public sealed record ActualizarCitaVM(
    int Id,
    DateTime FechaHora,
    string Motivo,
    string? Estado = null,
    string? Diagnostico = null,
    string? Tratamiento = null) : IRequest<IOutcome<bool>>;
