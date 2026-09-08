using FluentValidation;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.IniciarSesion;

public sealed class IniciarSesionVMValidador : AbstractValidator<IniciarSesionVM>
{
    public IniciarSesionVMValidador()
    {
        RuleFor(x => x.Usuario).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Clave).NotEmpty().MinimumLength(8);
    }
}
