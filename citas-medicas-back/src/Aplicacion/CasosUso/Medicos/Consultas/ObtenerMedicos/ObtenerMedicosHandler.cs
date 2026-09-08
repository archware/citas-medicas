using Aplicacion.CasosUso.Medicos.Puertos;
using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Consultas.ObtenerMedicos;

internal sealed class ObtenerMedicosHandler
    : IRequestHandler<ObtenerMedicosVM, IOutcome<ResultadoGrilla<IEnumerable<MedicoResumen>>>>
{
    private readonly IRepositorioMedicos _repositorio;

    public ObtenerMedicosHandler(IRepositorioMedicos repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<IOutcome<ResultadoGrilla<IEnumerable<MedicoResumen>>>> Handle(
        ObtenerMedicosVM solicitud, CancellationToken ct)
    {
        var resultado = await _repositorio.ObtenerGrillaAsync(solicitud.Pagina, solicitud.TamanioPagina, solicitud.Filtro, ct);

        var resumenes = resultado.Data.Select(m => new MedicoResumen(
            m.Id,
            m.Nombres,
            m.Apellidos,
            m.NumeroColegiatura,
            m.Especialidad,
            m.Telefono,
            m.Correo,
            m.BActivo));

        var grilla = new ResultadoGrilla<IEnumerable<MedicoResumen>>
        {
            TotalPaginas = solicitud.TamanioPagina,
            TotalRegistros = resultado.Total,
            Data = resumenes
        };

        return new SuccessResult<ResultadoGrilla<IEnumerable<MedicoResumen>>>(grilla);
    }
}
