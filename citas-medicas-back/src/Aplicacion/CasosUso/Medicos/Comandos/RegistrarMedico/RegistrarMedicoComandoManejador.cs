using Aplicacion.CasosUso.Medicos.Puertos;
using Aplicacion.Comun.Modelos;
using Dominio.Medicos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Comandos.RegistrarMedico;

internal sealed class RegistrarMedicoComandoManejador : IRequestHandler<RegistrarMedicoComando, ResultadoCitaMedica<int>>
{
    private readonly IRepositorioMedicos _repositorio;

    public RegistrarMedicoComandoManejador(IRepositorioMedicos repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<ResultadoCitaMedica<int>> Handle(RegistrarMedicoComando solicitud, CancellationToken ct)
    {
        var medico = new Medico
        {
            Nombres = solicitud.Nombres,
            Apellidos = solicitud.Apellidos,
            NumeroColegiatura = solicitud.NumeroColegiatura,
            Especialidad = solicitud.Especialidad,
            Telefono = solicitud.Telefono,
            Correo = solicitud.Correo
        };

        var id = await _repositorio.CrearAsync(medico, ct);

        return new ExitoCitaMedica<int>(id) { StatusCode = 201 };
    }
}

