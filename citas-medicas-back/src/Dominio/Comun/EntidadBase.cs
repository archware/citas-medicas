namespace Dominio.Comun;

public abstract class EntidadBase
{
    public int Id { get; set; }

    private readonly List<EventoBase> _eventosDominio = new();
    public IReadOnlyCollection<EventoBase> EventosDominio => _eventosDominio.AsReadOnly();

    public void AgregarEventoDominio(EventoBase evento) => _eventosDominio.Add(evento);
    public void RemoverEventoDominio(EventoBase evento) => _eventosDominio.Remove(evento);
    public void LimpiarEventosDominio() => _eventosDominio.Clear();
}
