namespace Aplicacion.Comun.Excepciones;

public sealed class AccesoProhibidoExcepcion : Exception
{
    public AccesoProhibidoExcepcion() : base() { }
    public AccesoProhibidoExcepcion(string mensaje) : base(mensaje) { }
}
