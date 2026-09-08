namespace Aplicacion.CasosUso.Autenticacion.Comun;

public sealed record RenovarTokenRespuesta(
    string TokenAcceso,
    string TokenRefresco,
    DateTime ExpiraEn);
