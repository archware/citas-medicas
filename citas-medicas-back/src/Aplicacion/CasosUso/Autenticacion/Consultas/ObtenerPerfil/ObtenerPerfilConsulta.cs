using Aplicacion.CasosUso.Autenticacion.Comun;
using MediatR;
using Aplicacion.Comun.Modelos;

namespace Aplicacion.CasosUso.Autenticacion.Consultas.ObtenerPerfil;

public sealed record ObtenerPerfilConsulta(int IdUsuario) : IRequest<ResultadoCitaMedica<PerfilUsuarioRespuesta>>;


