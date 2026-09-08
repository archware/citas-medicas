using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.CerrarSesion;

public sealed record CerrarSesionVM(string TokenAcceso) : IRequest<IOutcome<bool>>;
