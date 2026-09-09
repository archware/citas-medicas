using MediatR;
using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Pacientes.Puertos;

namespace Aplicacion.CasosUso.Pacientes.Comandos.EliminarPaciente;

internal sealed class EliminarPacienteComandoManejador : IRequestHandler<EliminarPacienteComando, ResultadoCitaMedica<bool>>
{
    private readonly IRepositorioPacientes _repositorio;

    public EliminarPacienteComandoManejador(IRepositorioPacientes repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<ResultadoCitaMedica<bool>> Handle(EliminarPacienteComando request, CancellationToken cancellationToken)
    {
        var paciente = await _repositorio.ObtenerPorIdAsync(request.Id, cancellationToken);
        if (paciente == null)
            return new ErrorCitaMedica<bool>("Paciente no encontrado") { StatusCode = 404 };

        await _repositorio.EliminarAsync(request.Id, cancellationToken);
        return new ExitoCitaMedica<bool>(true);
    }
}

