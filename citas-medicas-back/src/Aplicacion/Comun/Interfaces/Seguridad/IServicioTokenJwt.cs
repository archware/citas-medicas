namespace Aplicacion.Comun.Interfaces.Seguridad;

public interface IServicioTokenJwt
{
    string GenerarTokenAcceso(int idUsuario, string nombreUsuario, string jwtId, DateTime expiraEn);
}
