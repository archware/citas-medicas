using Aplicacion.Comun.Modelos;
using MediatR;

namespace Aplicacion.CasosUso.Medicos.Comandos.RegistrarMedico;

public sealed record RegistrarMedicoVM(
    string Nombres,
    string Apellidos,
    string NumeroColegiatura,
    string Especialidad,
    string? Telefono,
    string? Correo) : IRequest<IOutcome<int>>;
