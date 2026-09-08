using Aplicacion.CasosUso.Citas.Puertos;
using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Citas.Consultas.ObtenerCitas;

internal sealed class ObtenerCitasHandler
    : IRequestHandler<ObtenerCitasVM, IOutcome<ResultadoGrilla<IEnumerable<CitaResumen>>>>
{
    private readonly IRepositorioCitas _repositorio;

    public ObtenerCitasHandler(IRepositorioCitas repositorio)
        => _repositorio = repositorio;

    public async Task<IOutcome<ResultadoGrilla<IEnumerable<CitaResumen>>>> Handle(
        ObtenerCitasVM solicitud,
        CancellationToken cancellationToken)
    {
        var resultado = await _repositorio.ObtenerGrillaAsync(solicitud.Pagina, solicitud.TamanioPagina, solicitud.IdPaciente, solicitud.IdMedico, solicitud.Fecha, solicitud.Estado, cancellationToken);
        
        var grilla = new ResultadoGrilla<IEnumerable<CitaResumen>>
        {
            TotalPaginas = solicitud.TamanioPagina,
            TotalRegistros = resultado.Total,
            Data = resultado.Data
        };

        return new SuccessResult<ResultadoGrilla<IEnumerable<CitaResumen>>>(grilla);
    }
}
