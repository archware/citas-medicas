using Aplicacion.Comun.Atributos;
using Aplicacion.CasosUso.Autenticacion.Comun;
using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.RenovarToken;

[PermitirSolicitudAnonima]
public sealed record RenovarTokenComando(string TokenAcceso, string TokenRefresco)
    : IRequest<ResultadoCitaMedica<RenovarTokenRespuesta>>;


