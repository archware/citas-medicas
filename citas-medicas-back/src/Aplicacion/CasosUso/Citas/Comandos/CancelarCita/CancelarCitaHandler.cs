using MediatR;
using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Citas.Puertos;

namespace Aplicacion.CasosUso.Citas.Comandos.CancelarCita;

internal sealed class CancelarCitaHandler : IRequestHandler<CancelarCitaVM, IOutcome<bool>>
{
    private readonly IRepositorioCitas _repositorio;

    public CancelarCitaHandler(IRepositorioCitas repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<IOutcome<bool>> Handle(CancelarCitaVM request, CancellationToken cancellationToken)
    {
        var cita = await _repositorio.ObtenerPorIdAsync(request.Id, cancellationToken);
        if (cita == null)
            return new ErrorResult<bool>("Cita no encontrada") { StatusCode = 404 };

        cita.Cancelar();
        await _repositorio.ActualizarAsync(cita, cancellationToken);

        return new SuccessResult<bool>(true);
    }
}
