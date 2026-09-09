using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Citas.Comandos.CancelarCita;

public sealed record CancelarCitaComando(int Id) : IRequest<ResultadoCitaMedica<bool>>;

