namespace Aplicacion.Comun.Modelos.Configuracion;

public sealed class ConfiguracionSeguridad
{
    public int MaxIntentosLogin { get; set; } = 5;
    public int DuracionBloqueoMinutos { get; set; } = 30;
    public int ExpiracionJwtMinutos { get; set; } = 15;
    public int ExpiracionRefreshTokenDias { get; set; } = 7;
    public int HistorialContrasenasN { get; set; } = 5;
}
