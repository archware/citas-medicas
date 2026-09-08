using Aplicacion.CasosUso.Medicos.Puertos;
using Aplicacion.Comun.Modelos;
using Dominio.Medicos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Comandos.RegistrarMedico;

internal sealed class RegistrarMedicoHandler : IRequestHandler<RegistrarMedicoVM, IOutcome<int>>
{
    private readonly IRepositorioMedicos _repositorio;

    public RegistrarMedicoHandler(IRepositorioMedicos repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<IOutcome<int>> Handle(RegistrarMedicoVM solicitud, CancellationToken ct)
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

        return new SuccessResult<int>(id) { StatusCode = 201 };
    }
}
