namespace Aplicacion.CasosUso.Autenticacion.Comun;

public sealed record IniciarSesionRespuesta(
    string TokenAcceso,
    string TokenRefresco,
    DateTime ExpiraEn);
