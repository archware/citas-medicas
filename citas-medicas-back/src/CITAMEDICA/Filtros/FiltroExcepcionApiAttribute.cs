using Aplicacion.Comun.Excepciones;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CITAMEDICA.Filtros;

public sealed class FiltroExcepcionApiAttribute : ExceptionFilterAttribute
{
    private readonly IDictionary<Type, Action<ExceptionContext>> _manejadores;

    public FiltroExcepcionApiAttribute()
    {
        _manejadores = new Dictionary<Type, Action<ExceptionContext>>
        {
            { typeof(ValidacionExcepcion), ManejarValidacion },
            { typeof(NoEncontradoExcepcion), ManejarNoEncontrado },
            { typeof(UnauthorizedAccessException), ManejarNoAutorizado },
            { typeof(AccesoProhibidoExcepcion), ManejarProhibido },
            { typeof(RestExcepcion), ManejarRest }
        };
    }

    public override void OnException(ExceptionContext context)
    {
        var tipo = context.Exception.GetType();
        if (_manejadores.TryGetValue(tipo, out var manejador))
        {
            manejador(context);
            return;
        }

        ManejarExcepcionDesconocida(context);
    }

    private static void ManejarValidacion(ExceptionContext context)
    {
        var excepcion = (ValidacionExcepcion)context.Exception;
        var detalles = new ValidationProblemDetails(excepcion.Errores)
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1"
        };
        context.Result = new BadRequestObjectResult(detalles);
        context.ExceptionHandled = true;
    }

    private static void ManejarNoEncontrado(ExceptionContext context)
    {
        var excepcion = (NoEncontradoExcepcion)context.Exception;
        var detalles = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
            Title = "Recurso no encontrado.",
            Detail = excepcion.Message
        };
        context.Result = new NotFoundObjectResult(detalles);
        context.ExceptionHandled = true;
    }

    private static void ManejarNoAutorizado(ExceptionContext context)
    {
        var detalles = new ProblemDetails
        {
            Status = StatusCodes.Status401Unauthorized,
            Title = "No autorizado.",
            Type = "https://tools.ietf.org/html/rfc7235#section-3.1"
        };
        context.Result = new ObjectResult(detalles) { StatusCode = StatusCodes.Status401Unauthorized };
        context.ExceptionHandled = true;
    }

    private static void ManejarProhibido(ExceptionContext context)
    {
        var detalles = new ProblemDetails
        {
            Status = StatusCodes.Status403Forbidden,
            Title = "Acceso prohibido.",
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3"
        };
        context.Result = new ObjectResult(detalles) { StatusCode = StatusCodes.Status403Forbidden };
        context.ExceptionHandled = true;
    }

    private static void ManejarRest(ExceptionContext context)
    {
        var excepcion = (RestExcepcion)context.Exception;
        context.Result = new ObjectResult(excepcion.Errores ?? new { message = excepcion.Message }) 
        { 
            StatusCode = (int)excepcion.CodigoEstado 
        };
        context.ExceptionHandled = true;
    }

    private static void ManejarExcepcionDesconocida(ExceptionContext context)
    {
        var detalles = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Se produjo un error al procesar la solicitud.",
            Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1"
        };
        context.Result = new ObjectResult(detalles) { StatusCode = StatusCodes.Status500InternalServerError };
        context.ExceptionHandled = true;
    }
}

