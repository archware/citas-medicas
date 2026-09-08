using FluentValidation.Results;

namespace Aplicacion.Comun.Excepciones;

public sealed class ValidacionExcepcion : Exception
{
    public IDictionary<string, string[]> Errores { get; }

    public ValidacionExcepcion() : base("Se produjeron uno o mas errores de validacion.")
    {
        Errores = new Dictionary<string, string[]>();
    }

    public ValidacionExcepcion(IEnumerable<ValidationFailure> fallos) : this()
    {
        Errores = fallos
            .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
            .ToDictionary(grupo => grupo.Key, grupo => grupo.ToArray());
    }
}
