using Aplicacion.CasosUso.Citas.Puertos;
using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Citas.Consultas.ObtenerCitas;

internal sealed class ObtenerCitasConsultaManejador
    : IRequestHandler<ObtenerCitasConsulta, ResultadoCitaMedica<ResultadoGrilla<IEnumerable<CitaResumen>>>>
{
    private readonly IRepositorioCitas _repositorio;

    public ObtenerCitasConsultaManejador(IRepositorioCitas repositorio)
        => _repositorio = repositorio;

    public async Task<ResultadoCitaMedica<ResultadoGrilla<IEnumerable<CitaResumen>>>> Handle(
        ObtenerCitasConsulta solicitud,
        CancellationToken cancellationToken)
    {
        var resultado = await _repositorio.ObtenerGrillaAsync(solicitud.Pagina, solicitud.TamanioPagina, solicitud.IdPaciente, solicitud.IdMedico, solicitud.Fecha, solicitud.Estado, cancellationToken);
        
        var grilla = new ResultadoGrilla<IEnumerable<CitaResumen>>
        {
            TotalPaginas = solicitud.TamanioPagina,
            TotalRegistros = resultado.Total,
            Data = resultado.Data
        };

        return new ExitoCitaMedica<ResultadoGrilla<IEnumerable<CitaResumen>>>(grilla);
    }
}

