using Aplicacion.Comun.Interfaces.Seguridad;
using Aplicacion.Comun.Modelos.Configuracion;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace Infraestructura.Persistencia.SqlServer.Seguridad;

internal sealed class RepositorioIntentosLoginSqlServer : IServicioIntentosLogin
{
    private readonly string _cadenaConexion;
    private readonly ConfiguracionSeguridad _configuracion;

    public RepositorioIntentosLoginSqlServer(IConfiguration configuracion, ConfiguracionSeguridad configuracionSeguridad)
    {
        _cadenaConexion = configuracion.GetConnectionString("CitasMedicas") ?? string.Empty;
        _configuracion = configuracionSeguridad;
    }

    public async Task<bool> EstaBloquedoAsync(int idUsuario, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "SELECT d_fin_bloqueo FROM intentos_login WHERE i_id_usuario = @IdUsuario", conexion);
        comando.Parameters.Add("@IdUsuario", SqlDbType.Int).Value = idUsuario;

        await conexion.OpenAsync(ct);
        var resultado = await comando.ExecuteScalarAsync(ct);

        if (resultado != null && resultado != DBNull.Value)
        {
            return (DateTime)resultado > DateTime.UtcNow;
        }
        return false;
    }

    public async Task RegistrarIntentoFallidoAsync(int idUsuario, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "IF EXISTS (SELECT 1 FROM intentos_login WHERE i_id_usuario = @IdUsuario) " +
            "BEGIN " +
            "  UPDATE intentos_login SET i_intentos_fallidos = i_intentos_fallidos + 1 WHERE i_id_usuario = @IdUsuario; " +
            "  UPDATE intentos_login SET d_fin_bloqueo = DATEADD(minute, @Minutos, GETUTCDATE()) WHERE i_id_usuario = @IdUsuario AND i_intentos_fallidos >= @MaxIntentos; " +
            "END " +
            "ELSE " +
            "BEGIN " +
            "  INSERT INTO intentos_login (i_id_usuario, i_intentos_fallidos) VALUES (@IdUsuario, 1); " +
            "END", conexion);

        comando.Parameters.Add("@IdUsuario", SqlDbType.Int).Value = idUsuario;
        comando.Parameters.Add("@Minutos", SqlDbType.Int).Value = _configuracion.DuracionBloqueoMinutos;
        comando.Parameters.Add("@MaxIntentos", SqlDbType.Int).Value = _configuracion.MaxIntentosLogin;

        await conexion.OpenAsync(ct);
        await comando.ExecuteNonQueryAsync(ct);
    }

    public async Task ReiniciarIntentosAsync(int idUsuario, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "DELETE FROM intentos_login WHERE i_id_usuario = @IdUsuario", conexion);
        comando.Parameters.Add("@IdUsuario", SqlDbType.Int).Value = idUsuario;

        await conexion.OpenAsync(ct);
        await comando.ExecuteNonQueryAsync(ct);
    }
}
