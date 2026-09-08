namespace Aplicacion.Comun.Interfaces.Seguridad;

public interface IProtectorSecretoMfa
{
    string Cifrar(string secreto);
    string Descifrar(string secretoCifrado);
}
