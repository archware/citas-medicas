using MediatR;
using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Pacientes.Puertos;

namespace Aplicacion.CasosUso.Pacientes.Consultas.ObtenerPacientes;

internal sealed class ObtenerPacientesConsultaManejador : IRequestHandler<ObtenerPacientesConsulta, ResultadoCitaMedica<ResultadoGrilla<IEnumerable<PacienteResumen>>>>
{
    private readonly IRepositorioPacientes _repositorioPacientes;

    public ObtenerPacientesConsultaManejador(IRepositorioPacientes repositorioPacientes)
    {
        _repositorioPacientes = repositorioPacientes;
    }

    public async Task<ResultadoCitaMedica<ResultadoGrilla<IEnumerable<PacienteResumen>>>> Handle(ObtenerPacientesConsulta solicitud, CancellationToken ct)
    {
        var resultado = await _repositorioPacientes.ObtenerGrillaAsync(solicitud.Pagina, solicitud.TamanioPagina, solicitud.Nombre, solicitud.Documento, ct);
        
        var resumenes = resultado.Data.Select(p => new PacienteResumen(
            p.Id,
            p.Nombres,
            p.Apellidos,
            p.NumeroDocumento,
            p.Telefono,
            p.Correo,
            p.FechaNacimiento
        ));

        var grilla = new ResultadoGrilla<IEnumerable<PacienteResumen>>
        {
            TotalPaginas = solicitud.TamanioPagina, // Trigger the setter calculation
            TotalRegistros = resultado.Total,
            Data = resumenes
        };

        return new ExitoCitaMedica<ResultadoGrilla<IEnumerable<PacienteResumen>>>(grilla);
    }
}

