using System;
using Dominio.Comun;

namespace Dominio.Citas;

public sealed class Cita
{
    public int Id { get; private set; }
    public int IdPaciente { get; private set; }
    public int IdMedico { get; private set; }
    public DateTime FechaHora { get; private set; }
    public string Motivo { get; private set; } = string.Empty;
    public EstadoCita Estado { get; private set; }
    public string IdIdempotencia { get; private set; } = string.Empty;
    public string? Diagnostico { get; private set; }
    public string? Tratamiento { get; private set; }

    private Cita() { }

    public static Cita Registrar(int idPaciente, int idMedico, DateTime fechaHora, string motivo, string idIdempotencia, EstadoCita estado = EstadoCita.Programada, string? diagnostico = null, string? tratamiento = null)
    {
        if (idPaciente <= 0) throw new ArgumentException("IdPaciente debe ser positivo.", nameof(idPaciente));
        if (idMedico <= 0) throw new ArgumentException("IdMedico debe ser positivo.", nameof(idMedico));
        if (fechaHora <= DateTime.UtcNow) throw new ArgumentException("FechaHora debe ser futura.", nameof(fechaHora));
        if (string.IsNullOrWhiteSpace(motivo)) throw new ArgumentException("Motivo es obligatorio.", nameof(motivo));
        if (string.IsNullOrWhiteSpace(idIdempotencia)) throw new ArgumentException("IdIdempotencia es obligatorio.", nameof(idIdempotencia));

        return new Cita
        {
            IdPaciente = idPaciente,
            IdMedico = idMedico,
            FechaHora = fechaHora,
            Motivo = motivo.Trim(),
            Estado = estado,
            IdIdempotencia = idIdempotencia,
            Diagnostico = diagnostico?.Trim(),
            Tratamiento = tratamiento?.Trim()
        };
    }

    public void Actualizar(DateTime fechaHora, string motivo, string? diagnostico, string? tratamiento)
    {
        if (Estado == EstadoCita.Cancelada) throw new InvalidOperationException("No se puede actualizar una cita cancelada.");
        if (string.IsNullOrWhiteSpace(motivo)) throw new ArgumentException("Motivo es obligatorio.", nameof(motivo));

        FechaHora = fechaHora;
        Motivo = motivo.Trim();
        Diagnostico = diagnostico?.Trim();
        Tratamiento = tratamiento?.Trim();
    }
    
    public void CambiarEstado(EstadoCita estado)
    {
        Estado = estado;
    }

    public void Cancelar()
    {
        if (Estado == EstadoCita.Completada) throw new InvalidOperationException("No se puede cancelar una cita completada.");
        Estado = EstadoCita.Cancelada;
    }
}
