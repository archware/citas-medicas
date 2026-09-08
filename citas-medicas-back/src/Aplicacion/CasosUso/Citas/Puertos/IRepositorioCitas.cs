using Dominio.Citas;

namespace Aplicacion.CasosUso.Citas.Puertos;

public interface IRepositorioCitas
{
    Task<int> GuardarAsync(Cita cita, CancellationToken cancellationToken = default);
    Task<Cita?> ObtenerPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Consultas.ObtenerCitas.CitaResumen> Data, int Total)> ObtenerGrillaAsync(int pagina, int tamanioPagina, int? idPaciente, int? idMedico, DateTime? fecha, string? estado, CancellationToken ct = default);
    Task ActualizarAsync(Cita cita, CancellationToken cancellationToken = default);
    Task<bool> VerificarChoqueHorarioAsync(int idMedico, DateTime fechaHora, CancellationToken cancellationToken = default);
}
