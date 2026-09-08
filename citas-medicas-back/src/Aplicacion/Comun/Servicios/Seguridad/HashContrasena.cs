namespace Aplicacion.Comun.Servicios.Seguridad;

public sealed class HashContrasena : Interfaces.Seguridad.IHashContrasena
{
    private const int FactorTrabajo = 12;

    public string Hashear(string contrasena)
        => BCrypt.Net.BCrypt.HashPassword(contrasena, FactorTrabajo);

    public bool Verificar(string contrasena, string hash)
        => BCrypt.Net.BCrypt.Verify(contrasena, hash);
}
