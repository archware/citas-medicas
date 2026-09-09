using System.Security.Claims;
using System.Text;
using Aplicacion.Comun.Interfaces;
using Aplicacion.Comun.Interfaces.Configuracion;
using Aplicacion.Comun.Interfaces.Seguridad;
using CITAMEDICA.Filtros;
using CITAMEDICA.Servicios;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace CITAMEDICA;

public static class ConfigureServicesWebApi
{
    public static IServiceCollection AnadirServiciosWebApi(
        this IServiceCollection services, IConfiguration configuration)
    {
        // Servicio de usuario actual
        services.AddHttpContextAccessor();
        services.AddScoped<IServicioUsuarioActual, ServicioUsuarioActual>();

        // Lista negra de tokens (en memoria por ahora)
        services.AddSingleton<IListaNegraTokens, ListaNegraTokensEnMemoria>();

        // Filtro de excepciones
        services.AddControllers(options =>
            options.Filters.Add<FiltroExcepcionApiAttribute>());

        // JWT Authentication
        var configJwt = services.BuildServiceProvider()
            .GetRequiredService<IConfiguracionJwt>();

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(configJwt.Key)),
                ValidateIssuer = true,
                ValidIssuer = configJwt.Issuer,
                ValidateAudience = true,
                ValidAudience = configJwt.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        services.AddAuthorization();
        services.AddSwaggerGen();

        return services;
    }
}

