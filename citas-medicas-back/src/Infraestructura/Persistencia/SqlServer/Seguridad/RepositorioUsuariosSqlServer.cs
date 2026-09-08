using Aplicacion.CasosUso.Autenticacion.Puertos;
using Dominio.Entidades.Seguridad;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace Infraestructura.Persistencia.SqlServer.Seguridad;

internal sealed class RepositorioUsuariosSqlServer : IRepositorioUsuarios
{
    private readonly string _cadenaConexion;

    public RepositorioUsuariosSqlServer(IConfiguration configuracion)
    {
        _cadenaConexion = configuracion.GetConnectionString("CitasMedicas") ?? string.Empty;
    }

    public async Task<Usuario?> ObtenerPorNombreUsuarioAsync(string nombreUsuario, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "SELECT i_id, v_nombre_usuario, v_hash_contrasena, b_activo, v_correo, v_nombre_completo " +
            "FROM usuarios WHERE v_nombre_usuario = @NombreUsuario", conexion);
        comando.Parameters.Add("@NombreUsuario", SqlDbType.VarChar, 160).Value = nombreUsuario;

        await conexion.OpenAsync(ct);
        using var lector = await comando.ExecuteReaderAsync(ct);

        if (await lector.ReadAsync(ct))
        {
            return MapearUsuario(lector);
        }
        return null;
    }

    public async Task<Usuario?> ObtenerPorIdAsync(int id, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "SELECT i_id, v_nombre_usuario, v_hash_contrasena, b_activo, v_correo, v_nombre_completo " +
            "FROM usuarios WHERE i_id = @Id", conexion);
        comando.Parameters.Add("@Id", SqlDbType.Int).Value = id;

        await conexion.OpenAsync(ct);
        using var lector = await comando.ExecuteReaderAsync(ct);

        if (await lector.ReadAsync(ct))
        {
            return MapearUsuario(lector);
        }
        return null;
    }

    private static Usuario MapearUsuario(SqlDataReader lector)
    {
        return new Usuario
        {
            Id = lector.GetInt32(lector.GetOrdinal("i_id")),
            NombreUsuario = lector.GetString(lector.GetOrdinal("v_nombre_usuario")),
            HashContrasena = lector.GetString(lector.GetOrdinal("v_hash_contrasena")),
            BActivo = lector.GetBoolean(lector.GetOrdinal("b_activo")),
            Correo = lector.IsDBNull(lector.GetOrdinal("v_correo")) ? null : lector.GetString(lector.GetOrdinal("v_correo")),
            NombreCompleto = lector.IsDBNull(lector.GetOrdinal("v_nombre_completo")) ? null : lector.GetString(lector.GetOrdinal("v_nombre_completo"))
        };
    }
}
