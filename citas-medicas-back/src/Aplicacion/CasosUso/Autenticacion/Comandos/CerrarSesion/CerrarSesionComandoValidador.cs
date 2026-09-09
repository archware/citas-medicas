using FluentValidation;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.CerrarSesion;

public sealed class CerrarSesionComandoValidador : AbstractValidator<CerrarSesionComando>
{
    public CerrarSesionComandoValidador()
    {
        RuleFor(x => x.TokenAcceso).NotEmpty();
    }
}

