using Aplicacion.Comun.Modelos;
using MediatR;
using Dominio.Citas;

namespace Aplicacion.CasosUso.Citas.Comandos.RegistrarCita;

public sealed record RegistrarCitaComando(
    int IdPaciente,
    int IdMedico,
    DateTime FechaHora,
    string Motivo,
    string IdIdempotencia,
    string? Estado = null,
    string? Diagnostico = null,
    string? Tratamiento = null) : IRequest<ResultadoCitaMedica<int>>;

