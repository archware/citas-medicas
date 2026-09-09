using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Pacientes.Comandos.EliminarPaciente;

public sealed record EliminarPacienteComando(int Id) : IRequest<ResultadoCitaMedica<bool>>;

