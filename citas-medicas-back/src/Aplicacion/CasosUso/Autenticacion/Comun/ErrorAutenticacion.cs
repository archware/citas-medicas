namespace Aplicacion.CasosUso.Autenticacion.Comun;

public sealed record ErrorAutenticacion(
    CodigoErrorAutenticacion Codigo,
    string Titulo,
    string Detalle);
