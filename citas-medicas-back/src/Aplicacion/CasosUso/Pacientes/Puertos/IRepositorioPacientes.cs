using Dominio.Entidades;

namespace Aplicacion.CasosUso.Pacientes.Puertos;

public interface IRepositorioPacientes
{
    Task<Paciente?> ObtenerPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Paciente>> ObtenerTodosAsync(CancellationToken cancellationToken = default);
    Task<(IEnumerable<Paciente> Data, int Total)> ObtenerGrillaAsync(int pagina, int tamanioPagina, string? nombre, string? documento, CancellationToken cancellationToken = default);
    Task<int> CrearAsync(Paciente paciente, CancellationToken cancellationToken = default);
    Task ActualizarAsync(Paciente paciente, CancellationToken cancellationToken = default);
    Task EliminarAsync(int id, CancellationToken cancellationToken = default);
}
