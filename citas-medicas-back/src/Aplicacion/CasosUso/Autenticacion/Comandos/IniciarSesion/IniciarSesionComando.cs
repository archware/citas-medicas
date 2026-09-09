using Aplicacion.Comun.Atributos;
using Aplicacion.CasosUso.Autenticacion.Comun;
using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.IniciarSesion;

[PermitirSolicitudAnonima]
public sealed record IniciarSesionComando(string Usuario, string Clave)
    : IRequest<ResultadoCitaMedica<IniciarSesionRespuesta>>;

