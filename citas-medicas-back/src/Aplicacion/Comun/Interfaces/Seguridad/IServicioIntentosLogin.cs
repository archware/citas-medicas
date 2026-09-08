namespace Aplicacion.Comun.Interfaces.Seguridad;

public interface IServicioIntentosLogin
{
    Task<bool> EstaBloquedoAsync(int idUsuario, CancellationToken ct = default);
    Task RegistrarIntentoFallidoAsync(int idUsuario, CancellationToken ct = default);
    Task ReiniciarIntentosAsync(int idUsuario, CancellationToken ct = default);
}
