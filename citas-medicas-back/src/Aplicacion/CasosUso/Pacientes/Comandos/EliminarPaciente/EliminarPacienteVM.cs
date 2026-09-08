using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Pacientes.Comandos.EliminarPaciente;

public sealed record EliminarPacienteVM(int Id) : IRequest<IOutcome<bool>>;
