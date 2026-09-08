namespace Dominio.Comun;

public abstract class EventoBase
{
    public Guid IdEvento { get; } = Guid.NewGuid();
    public DateTimeOffset FechaOcurrencia { get; } = DateTimeOffset.UtcNow;
}
