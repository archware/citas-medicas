using MediatR;
using Aplicacion.Comun.Modelos;
using Aplicacion.CasosUso.Pacientes.Puertos;
using Dominio.Entidades;

namespace Aplicacion.CasosUso.Pacientes.Comandos.RegistrarPaciente;

internal sealed class RegistrarPacienteComandoManejador : IRequestHandler<RegistrarPacienteComando, ResultadoCitaMedica<int>>
{
    private readonly IRepositorioPacientes _repositorioPacientes;

    public RegistrarPacienteComandoManejador(IRepositorioPacientes repositorioPacientes)
    {
        _repositorioPacientes = repositorioPacientes;
    }

    public async Task<ResultadoCitaMedica<int>> Handle(RegistrarPacienteComando solicitud, CancellationToken ct)
    {
        var paciente = Paciente.Registrar(
            solicitud.Nombres,
            solicitud.Apellidos,
            solicitud.NumeroDocumento,
            solicitud.Telefono,
            solicitud.Correo,
            solicitud.FechaNacimiento,
            solicitud.Genero,
            solicitud.Direccion
        );

        var id = await _repositorioPacientes.CrearAsync(paciente, ct);
        return new ExitoCitaMedica<int>(id) { StatusCode = 201 };
    }
}

