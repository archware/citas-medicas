using Dominio.Medicos;

namespace Aplicacion.CasosUso.Medicos.Puertos;

public interface IRepositorioMedicos
{
    Task<int> CrearAsync(Medico medico, CancellationToken ct = default);
    Task<Medico?> ObtenerPorIdAsync(int id, CancellationToken ct = default);
    Task ActualizarAsync(Medico medico, CancellationToken ct = default);
    Task EliminarAsync(int id, CancellationToken ct = default);
    Task<(IEnumerable<Medico> Data, int Total)> ObtenerGrillaAsync(int pagina, int tamanioPagina, string? filtro, CancellationToken ct = default);
}
