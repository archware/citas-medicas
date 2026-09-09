using FluentValidation;

namespace Aplicacion.CasosUso.Autenticacion.Comandos.IniciarSesion;

public sealed class IniciarSesionComandoValidador : AbstractValidator<IniciarSesionComando>
{
    public IniciarSesionComandoValidador()
    {
        RuleFor(x => x.Usuario).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Clave).NotEmpty().MinimumLength(8);
    }
}

