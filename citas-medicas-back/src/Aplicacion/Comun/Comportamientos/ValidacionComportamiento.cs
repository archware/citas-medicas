using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.Comun.Comportamientos;

public sealed class ValidacionComportamiento<TSolicitud, TRespuesta>
    : IPipelineBehavior<TSolicitud, TRespuesta>
    where TSolicitud : IRequest<TRespuesta>
{
    private readonly IEnumerable<IValidator<TSolicitud>> _validadores;

    public ValidacionComportamiento(IEnumerable<IValidator<TSolicitud>> validadores)
    {
        _validadores = validadores;
    }

    public async Task<TRespuesta> Handle(
        TSolicitud solicitud,
        RequestHandlerDelegate<TRespuesta> siguiente,
        CancellationToken cancellationToken)
    {
        if (!_validadores.Any()) return await siguiente();

        var contexto = new ValidationContext<TSolicitud>(solicitud);
        var resultados = await Task.WhenAll(
            _validadores.Select(v => v.ValidateAsync(contexto, cancellationToken)));

        var fallos = resultados
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (fallos.Count == 0) return await siguiente();

        if (typeof(IOutcome).IsAssignableFrom(typeof(TRespuesta)))
        {
            var mensaje = string.Join("; ", fallos.Select(f => f.ErrorMessage));
            var detailError = new DetailError("422", mensaje);
            
            if (typeof(TRespuesta).IsGenericType && typeof(TRespuesta).GetGenericTypeDefinition() == typeof(IOutcome<>))
            {
                var tipoGenerico = typeof(TRespuesta).GetGenericArguments()[0];
                var tipoResultado = typeof(SuccessResult<>).MakeGenericType(tipoGenerico);
                var resultado = (IOutcome)Activator.CreateInstance(tipoResultado)!;
                resultado.StatusCode = 422;
                var prop = resultado.GetType().GetProperty("detailError");
                prop?.SetValue(resultado, detailError);
                return (TRespuesta)resultado;
            }
            else
            {
                var resultado = new SuccessResult
                {
                    StatusCode = 422,
                    detailError = detailError
                };
                return (TRespuesta)(object)resultado;
            }
        }

        throw new Excepciones.ValidacionExcepcion(fallos);
    }
}
