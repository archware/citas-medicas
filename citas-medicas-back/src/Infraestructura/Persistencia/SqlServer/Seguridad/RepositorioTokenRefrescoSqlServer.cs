using Aplicacion.Comun.Interfaces.Seguridad;
using Aplicacion.Comun.Modelos.Configuracion;
using Dominio.Entidades.Seguridad;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Security.Cryptography;

namespace Infraestructura.Persistencia.SqlServer.Seguridad;

internal sealed class RepositorioTokenRefrescoSqlServer : IServicioTokenRefresco
{
    private readonly string _cadenaConexion;
    private readonly ConfiguracionSeguridad _configuracion;

    public RepositorioTokenRefrescoSqlServer(IConfiguration configuracion, ConfiguracionSeguridad configuracionSeguridad)
    {
        _cadenaConexion = configuracion.GetConnectionString("CitasMedicas") ?? string.Empty;
        _configuracion = configuracionSeguridad;
    }

    public async Task<TokenRefresco> GenerarAsync(int idUsuario, string idJwt, string? ip, string? agenteUsuario, CancellationToken ct = default)
    {
        var token = new TokenRefresco
        {
            IdUsuario = idUsuario,
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            IdJwt = idJwt,
            FechaCreacion = DateTime.UtcNow,
            FechaExpiracion = DateTime.UtcNow.AddDays(_configuracion.ExpiracionRefreshTokenDias),
            IpCreacion = ip,
            AgenteUsuario = agenteUsuario
        };

        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "INSERT INTO tokens_refresco (i_id_usuario, v_token, v_id_jwt, d_fecha_creacion, d_fecha_expiracion, b_usado, b_revocado, v_ip_creacion, v_agente_usuario) " +
            "OUTPUT INSERTED.i_id " +
            "VALUES (@IdUsuario, @Token, @IdJwt, @FechaCreacion, @FechaExpiracion, 0, 0, @Ip, @Agente)", conexion);
        
        comando.Parameters.Add("@IdUsuario", SqlDbType.Int).Value = token.IdUsuario;
        comando.Parameters.Add("@Token", SqlDbType.VarChar, 100).Value = token.Token;
        comando.Parameters.Add("@IdJwt", SqlDbType.VarChar, 100).Value = token.IdJwt;
        comando.Parameters.Add("@FechaCreacion", SqlDbType.DateTime2).Value = token.FechaCreacion;
        comando.Parameters.Add("@FechaExpiracion", SqlDbType.DateTime2).Value = token.FechaExpiracion;
        comando.Parameters.Add("@Ip", SqlDbType.VarChar, 50).Value = (object?)token.IpCreacion ?? DBNull.Value;
        comando.Parameters.Add("@Agente", SqlDbType.VarChar, 500).Value = (object?)token.AgenteUsuario ?? DBNull.Value;

        await conexion.OpenAsync(ct);
        token.Id = (int)await comando.ExecuteScalarAsync(ct);

        return token;
    }

    public async Task<TokenRefresco?> ObtenerPorTokenAsync(string token, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "SELECT i_id, i_id_usuario, v_token, v_id_jwt, d_fecha_creacion, d_fecha_expiracion, b_usado, b_revocado, d_fecha_revocacion, i_id_token_reemplazo " +
            "FROM tokens_refresco WHERE v_token = @Token", conexion);
        comando.Parameters.Add("@Token", SqlDbType.VarChar, 100).Value = token;

        await conexion.OpenAsync(ct);
        using var lector = await comando.ExecuteReaderAsync(ct);

        if (await lector.ReadAsync(ct))
        {
            return new TokenRefresco
            {
                Id = lector.GetInt32(lector.GetOrdinal("i_id")),
                IdUsuario = lector.GetInt32(lector.GetOrdinal("i_id_usuario")),
                Token = lector.GetString(lector.GetOrdinal("v_token")),
                IdJwt = lector.GetString(lector.GetOrdinal("v_id_jwt")),
                FechaCreacion = lector.GetDateTime(lector.GetOrdinal("d_fecha_creacion")),
                FechaExpiracion = lector.GetDateTime(lector.GetOrdinal("d_fecha_expiracion")),
                BUsado = lector.GetBoolean(lector.GetOrdinal("b_usado")),
                BRevocado = lector.GetBoolean(lector.GetOrdinal("b_revocado")),
                FechaRevocacion = lector.IsDBNull(lector.GetOrdinal("d_fecha_revocacion")) ? null : lector.GetDateTime(lector.GetOrdinal("d_fecha_revocacion")),
                IdTokenReemplazo = lector.IsDBNull(lector.GetOrdinal("i_id_token_reemplazo")) ? null : lector.GetInt32(lector.GetOrdinal("i_id_token_reemplazo"))
            };
        }
        return null;
    }

    public async Task MarcarUsadoAsync(int idToken, int? idReemplazo, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "UPDATE tokens_refresco SET b_usado = 1, i_id_token_reemplazo = @IdReemplazo WHERE i_id = @Id", conexion);
        comando.Parameters.Add("@Id", SqlDbType.Int).Value = idToken;
        comando.Parameters.Add("@IdReemplazo", SqlDbType.Int).Value = (object?)idReemplazo ?? DBNull.Value;

        await conexion.OpenAsync(ct);
        await comando.ExecuteNonQueryAsync(ct);
    }

    public async Task RevocarTodosDelUsuarioAsync(int idUsuario, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "UPDATE tokens_refresco SET b_revocado = 1, d_fecha_revocacion = @Ahora WHERE i_id_usuario = @IdUsuario AND b_revocado = 0", conexion);
        comando.Parameters.Add("@IdUsuario", SqlDbType.Int).Value = idUsuario;
        comando.Parameters.Add("@Ahora", SqlDbType.DateTime2).Value = DateTime.UtcNow;

        await conexion.OpenAsync(ct);
        await comando.ExecuteNonQueryAsync(ct);
    }
}
