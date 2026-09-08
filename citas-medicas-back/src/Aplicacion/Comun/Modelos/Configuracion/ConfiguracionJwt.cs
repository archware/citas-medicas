using Aplicacion.Comun.Interfaces.Configuracion;

namespace Aplicacion.Comun.Modelos.Configuracion;

public sealed class ConfiguracionJwt : IConfiguracionJwt
{
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
}
