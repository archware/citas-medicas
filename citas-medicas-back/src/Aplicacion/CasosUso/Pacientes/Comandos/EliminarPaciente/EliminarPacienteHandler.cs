using MediatR;
using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Pacientes.Puertos;

namespace Aplicacion.CasosUso.Pacientes.Comandos.EliminarPaciente;

internal sealed class EliminarPacienteHandler : IRequestHandler<EliminarPacienteVM, IOutcome<bool>>
{
    private readonly IRepositorioPacientes _repositorio;

    public EliminarPacienteHandler(IRepositorioPacientes repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<IOutcome<bool>> Handle(EliminarPacienteVM request, CancellationToken cancellationToken)
    {
        var paciente = await _repositorio.ObtenerPorIdAsync(request.Id, cancellationToken);
        if (paciente == null)
            return new ErrorResult<bool>("Paciente no encontrado") { StatusCode = 404 };

        await _repositorio.EliminarAsync(request.Id, cancellationToken);
        return new SuccessResult<bool>(true);
    }
}
