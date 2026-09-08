using Aplicacion.CasosUso.Medicos.Puertos;
using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Comandos.EliminarMedico;

internal sealed class EliminarMedicoHandler : IRequestHandler<EliminarMedicoVM, IOutcome<bool>>
{
    private readonly IRepositorioMedicos _repositorio;

    public EliminarMedicoHandler(IRepositorioMedicos repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<IOutcome<bool>> Handle(EliminarMedicoVM solicitud, CancellationToken ct)
    {
        var medico = await _repositorio.ObtenerPorIdAsync(solicitud.Id, ct);
        if (medico == null)
            return new ErrorResult<bool>("Medico no encontrado") { StatusCode = 404 };

        await _repositorio.EliminarAsync(solicitud.Id, ct);
        return new SuccessResult<bool>(true);
    }
}
