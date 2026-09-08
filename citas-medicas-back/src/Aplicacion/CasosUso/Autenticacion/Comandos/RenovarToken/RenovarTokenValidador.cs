using FluentValidation;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.RenovarToken;

public sealed class RenovarTokenVMValidador : AbstractValidator<RenovarTokenVM>
{
    public RenovarTokenVMValidador()
    {
        RuleFor(x => x.TokenAcceso).NotEmpty();
        RuleFor(x => x.TokenRefresco).NotEmpty();
    }
}
