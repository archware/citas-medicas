namespace Aplicacion.Comun.Excepciones;

public sealed class NoEncontradoExcepcion : Exception
{
    public NoEncontradoExcepcion() : base() { }
    public NoEncontradoExcepcion(string mensaje) : base(mensaje) { }
    public NoEncontradoExcepcion(string nombre, object clave)
        : base($"La entidad \"{nombre}\" con clave ({clave}) no fue encontrada.") { }
}
