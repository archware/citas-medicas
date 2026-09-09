using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.CerrarSesion;

public sealed record CerrarSesionComando(string TokenAcceso) : IRequest<ResultadoCitaMedica<bool>>;

