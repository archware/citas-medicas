using FluentValidation;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.CerrarSesion;

public sealed class CerrarSesionVMValidador : AbstractValidator<CerrarSesionVM>
{
    public CerrarSesionVMValidador()
    {
        RuleFor(x => x.TokenAcceso).NotEmpty();
    }
}
