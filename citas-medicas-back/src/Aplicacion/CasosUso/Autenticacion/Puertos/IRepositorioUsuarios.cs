using Dominio.Entidades.Seguridad;

namespace Aplicacion.CasosUso.Autenticacion.Puertos;

public interface IRepositorioUsuarios
{
    Task<Usuario?> ObtenerPorNombreUsuarioAsync(string nombreUsuario, CancellationToken ct = default);
    Task<Usuario?> ObtenerPorIdAsync(int id, CancellationToken ct = default);
}
