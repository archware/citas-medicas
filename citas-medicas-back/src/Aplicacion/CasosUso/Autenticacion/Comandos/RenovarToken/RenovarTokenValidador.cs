using FluentValidation;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.RenovarToken;

public sealed class RenovarTokenComandoValidador : AbstractValidator<RenovarTokenComando>
{
    public RenovarTokenComandoValidador()
    {
        RuleFor(x => x.TokenAcceso).NotEmpty();
        RuleFor(x => x.TokenRefresco).NotEmpty();
    }
}

