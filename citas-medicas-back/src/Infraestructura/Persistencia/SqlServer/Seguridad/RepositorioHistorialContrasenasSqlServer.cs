using Aplicacion.Comun.Interfaces.Seguridad;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace Infraestructura.Persistencia.SqlServer.Seguridad;

internal sealed class RepositorioHistorialContrasenasSqlServer : IServicioHistorialContrasenas
{
    private readonly string _cadenaConexion;

    public RepositorioHistorialContrasenasSqlServer(IConfiguration configuracion)
    {
        _cadenaConexion = configuracion.GetConnectionString("CitasMedicas") ?? string.Empty;
    }

    public async Task<bool> FueUsadaRecientementeAsync(int idUsuario, string hashContrasena, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "SELECT TOP 5 v_hash_contrasena FROM historial_contrasenas WHERE i_id_usuario = @IdUsuario ORDER BY d_fecha_creacion DESC", conexion);
        comando.Parameters.Add("@IdUsuario", SqlDbType.Int).Value = idUsuario;

        await conexion.OpenAsync(ct);
        using var lector = await comando.ExecuteReaderAsync(ct);

        while (await lector.ReadAsync(ct))
        {
            if (lector.GetString(0) == hashContrasena)
                return true;
        }
        return false;
    }

    public async Task RegistrarAsync(int idUsuario, string hashContrasena, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "INSERT INTO historial_contrasenas (i_id_usuario, v_hash_contrasena, d_fecha_creacion) VALUES (@IdUsuario, @Hash, @Fecha)", conexion);
        comando.Parameters.Add("@IdUsuario", SqlDbType.Int).Value = idUsuario;
        comando.Parameters.Add("@Hash", SqlDbType.VarChar, 255).Value = hashContrasena;
        comando.Parameters.Add("@Fecha", SqlDbType.DateTime2).Value = DateTime.UtcNow;

        await conexion.OpenAsync(ct);
        await comando.ExecuteNonQueryAsync(ct);
    }
}
