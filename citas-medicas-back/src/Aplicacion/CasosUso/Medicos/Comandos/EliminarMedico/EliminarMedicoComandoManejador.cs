using Aplicacion.CasosUso.Medicos.Puertos;
using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Comandos.EliminarMedico;

internal sealed class EliminarMedicoComandoManejador : IRequestHandler<EliminarMedicoComando, ResultadoCitaMedica<bool>>
{
    private readonly IRepositorioMedicos _repositorio;

    public EliminarMedicoComandoManejador(IRepositorioMedicos repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<ResultadoCitaMedica<bool>> Handle(EliminarMedicoComando solicitud, CancellationToken ct)
    {
        var medico = await _repositorio.ObtenerPorIdAsync(solicitud.Id, ct);
        if (medico == null)
            return new ErrorCitaMedica<bool>("Medico no encontrado") { StatusCode = 404 };

        await _repositorio.EliminarAsync(solicitud.Id, ct);
        return new ExitoCitaMedica<bool>(true);
    }
}

