namespace Aplicacion.Comun.Interfaces.Seguridad;

public interface IServicioMfa
{
    string GenerarSecreto();
    bool ValidarCodigo(string secreto, string codigo);
    string GenerarCodigoRecuperacion();
}
