namespace Aplicacion.Comun.Interfaces.Seguridad;

public interface IServicioHistorialContrasenas
{
    Task<bool> FueUsadaRecientementeAsync(int idUsuario, string hashContrasena, CancellationToken ct = default);
    Task RegistrarAsync(int idUsuario, string hashContrasena, CancellationToken ct = default);
}
