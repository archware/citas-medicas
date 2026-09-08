using Aplicacion.CasosUso.Citas.Puertos;
using Aplicacion.CasosUso.Pacientes.Puertos;
using Infraestructura.Persistencia.SqlServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infraestructura;

public static class ExtensionesInyeccionInfraestructura
{
    public static IServiceCollection AnadirInfraestructura(
        this IServiceCollection servicios,
        IConfiguration configuracion)
    {
        var cadenaConexion = configuracion.GetConnectionString("CitasMedicas")
            ?? throw new InvalidOperationException(
                "ConnectionStrings:CitasMedicas debe configurarse fuera del repositorio.");

        servicios.AddScoped<IRepositorioCitas>(
            _ => new RepositorioCitasSqlServer(cadenaConexion));

        // Repositorios y Servicios de Seguridad (SQL Server nativo)
        servicios.AddScoped<Aplicacion.CasosUso.Autenticacion.Puertos.IRepositorioUsuarios, Persistencia.SqlServer.Seguridad.RepositorioUsuariosSqlServer>();
        servicios.AddScoped<Aplicacion.Comun.Interfaces.Seguridad.IServicioTokenRefresco, Persistencia.SqlServer.Seguridad.RepositorioTokenRefrescoSqlServer>();
        servicios.AddScoped<Aplicacion.Comun.Interfaces.Seguridad.IServicioIntentosLogin, Persistencia.SqlServer.Seguridad.RepositorioIntentosLoginSqlServer>();
        servicios.AddScoped<Aplicacion.Comun.Interfaces.Seguridad.IServicioHistorialContrasenas, Persistencia.SqlServer.Seguridad.RepositorioHistorialContrasenasSqlServer>();
        servicios.AddScoped<Aplicacion.Comun.Interfaces.Seguridad.IServicioMfa, Servicios.Seguridad.ServicioMfaOtp>();
        servicios.AddScoped<Aplicacion.Comun.Interfaces.Seguridad.IServicioTokenJwt, Servicios.Seguridad.ServicioTokenJwt>();

        // Pacientes
        servicios.AddScoped<IRepositorioPacientes, RepositorioPacientesSqlServer>();

        // Medicos
        servicios.AddScoped<Aplicacion.CasosUso.Medicos.Puertos.IRepositorioMedicos>(
            _ => new RepositorioMedicosSqlServer(cadenaConexion));

        return servicios;
    }
}
