using FluentValidation.Results;

namespace Aplicacion.Comun.Comportamientos;

public interface ISolicitudConValidacionTipada<TRespuesta>
{
    TRespuesta CrearResultadoValidacion(IReadOnlyList<ValidationFailure> errores);
}
