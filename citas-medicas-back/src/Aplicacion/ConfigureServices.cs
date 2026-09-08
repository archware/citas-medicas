using System.Reflection;
using Aplicacion.Comun.Comportamientos;
using Aplicacion.Comun.Interfaces.Configuracion;
using Aplicacion.Comun.Interfaces.Seguridad;
using Aplicacion.Comun.Modelos.Configuracion;
using Aplicacion.Comun.Servicios.Seguridad;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aplicacion;

public static class ConfigureServices
{
    public static IServiceCollection AnadirServiciosAplicacion(
        this IServiceCollection services, IConfiguration configuration)
    {
        // MediatR + validadores
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Pipeline behaviors (orden importa)
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidacionComportamiento<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ExcepcionNoControladaComportamiento<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(AutorizacionComportamiento<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(RendimientoComportamiento<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ExcepcionBaseDatosComportamiento<,>));

        // Configuracion de seguridad
        var configJwt = new ConfiguracionJwt();
        configuration.GetSection("ConfiguracionJwt").Bind(configJwt);
        services.AddSingleton<IConfiguracionJwt>(configJwt);

        var configSeguridad = new ConfiguracionSeguridad();
        configuration.GetSection("ConfiguracionSeguridad").Bind(configSeguridad);
        services.AddSingleton(configSeguridad);

        // Servicios de seguridad que pertenecen a Aplicacion
        services.AddScoped<IHashContrasena, HashContrasena>();

        return services;
    }
}
