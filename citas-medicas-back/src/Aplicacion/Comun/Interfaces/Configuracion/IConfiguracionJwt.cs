namespace Aplicacion.Comun.Interfaces.Configuracion;

public interface IConfiguracionJwt
{
    string Issuer { get; }
    string Audience { get; }
    string Key { get; }
}
