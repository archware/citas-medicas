using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Citas.Comandos.CancelarCita;

public sealed record CancelarCitaVM(int Id) : IRequest<IOutcome<bool>>;
