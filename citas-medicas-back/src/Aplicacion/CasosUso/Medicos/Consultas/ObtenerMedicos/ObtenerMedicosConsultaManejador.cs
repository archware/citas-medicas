using Aplicacion.CasosUso.Medicos.Puertos;
using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Consultas.ObtenerMedicos;

internal sealed class ObtenerMedicosConsultaManejador
    : IRequestHandler<ObtenerMedicosConsulta, ResultadoCitaMedica<ResultadoGrilla<IEnumerable<MedicoResumen>>>>
{
    private readonly IRepositorioMedicos _repositorio;

    public ObtenerMedicosConsultaManejador(IRepositorioMedicos repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<ResultadoCitaMedica<ResultadoGrilla<IEnumerable<MedicoResumen>>>> Handle(
        ObtenerMedicosConsulta solicitud, CancellationToken ct)
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

        return new ExitoCitaMedica<ResultadoGrilla<IEnumerable<MedicoResumen>>>(grilla);
    }
}

