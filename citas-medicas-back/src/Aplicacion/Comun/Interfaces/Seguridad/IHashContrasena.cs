namespace Aplicacion.Comun.Interfaces.Seguridad;

public interface IHashContrasena
{
    string Hashear(string contrasena);
    bool Verificar(string contrasena, string hash);
}
