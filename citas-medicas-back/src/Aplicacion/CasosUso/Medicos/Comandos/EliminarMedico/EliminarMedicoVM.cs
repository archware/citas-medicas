using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Comandos.EliminarMedico;

public sealed record EliminarMedicoVM(int Id) : IRequest<IOutcome<bool>>;
