using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Comandos.EliminarMedico;

public sealed record EliminarMedicoComando(int Id) : IRequest<ResultadoCitaMedica<bool>>;

