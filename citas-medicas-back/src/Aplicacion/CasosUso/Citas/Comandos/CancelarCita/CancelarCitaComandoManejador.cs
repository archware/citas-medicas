using MediatR;
using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Citas.Puertos;

namespace Aplicacion.CasosUso.Citas.Comandos.CancelarCita;

internal sealed class CancelarCitaComandoManejador : IRequestHandler<CancelarCitaComando, ResultadoCitaMedica<bool>>
{
    private readonly IRepositorioCitas _repositorio;

    public CancelarCitaComandoManejador(IRepositorioCitas repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<ResultadoCitaMedica<bool>> Handle(CancelarCitaComando request, CancellationToken cancellationToken)
    {
        var cita = await _repositorio.ObtenerPorIdAsync(request.Id, cancellationToken);
        if (cita == null)
            return new ErrorCitaMedica<bool>("Cita no encontrada") { StatusCode = 404 };

        cita.Cancelar();
        await _repositorio.ActualizarAsync(cita, cancellationToken);

        return new ExitoCitaMedica<bool>(true);
    }
}

