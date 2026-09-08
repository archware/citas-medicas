namespace Aplicacion.Comun.Interfaces;

public interface IServicioUsuarioActual
{
    string? IdUsuario { get; }
    string? TokenAcceso { get; }
}
