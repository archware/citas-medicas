using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Comandos.ActualizarMedico;

public sealed record ActualizarMedicoComando(
    int Id,
    string Nombres,
    string Apellidos,
    string NumeroColegiatura,
    string Especialidad,
    string? Telefono,
    string? Correo) : IRequest<ResultadoCitaMedica<bool>>;

