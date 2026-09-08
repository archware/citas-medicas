using Aplicacion.CasosUso.Medicos.Puertos;
using Dominio.Medicos;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Infraestructura.Persistencia.SqlServer;

internal sealed class RepositorioMedicosSqlServer : IRepositorioMedicos
{
    private readonly string _cadenaConexion;

    public RepositorioMedicosSqlServer(string cadenaConexion)
        => _cadenaConexion = cadenaConexion;

    public async Task<int> CrearAsync(Medico medico, CancellationToken ct = default)
    {
        const string sql = @"
            INSERT INTO medicos (v_nombres, v_apellidos, v_numero_colegiatura, v_especialidad, v_telefono, v_correo, b_activo, d_fecha_registro)
            OUTPUT INSERTED.i_id
            VALUES (@Nombres, @Apellidos, @Colegiatura, @Especialidad, @Telefono, @Correo, 1, GETDATE())";

        await using var cn = new SqlConnection(_cadenaConexion);
        await cn.OpenAsync(ct);
        await using var cmd = new SqlCommand(sql, cn);
        cmd.Parameters.AddWithValue("@Nombres", medico.Nombres);
        cmd.Parameters.AddWithValue("@Apellidos", medico.Apellidos);
        cmd.Parameters.AddWithValue("@Colegiatura", medico.NumeroColegiatura);
        cmd.Parameters.AddWithValue("@Especialidad", medico.Especialidad);
        cmd.Parameters.AddWithValue("@Telefono", (object?)medico.Telefono ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Correo", (object?)medico.Correo ?? DBNull.Value);
        return (int)(await cmd.ExecuteScalarAsync(ct))!;
    }

    public async Task<Medico?> ObtenerPorIdAsync(int id, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT i_id, v_nombres, v_apellidos, v_numero_colegiatura, v_especialidad, v_telefono, v_correo, b_activo
            FROM medicos WHERE i_id = @Id";

        await using var cn = new SqlConnection(_cadenaConexion);
        await cn.OpenAsync(ct);
        await using var cmd = new SqlCommand(sql, cn);
        cmd.Parameters.AddWithValue("@Id", id);

        using var r = await cmd.ExecuteReaderAsync(ct);
        if (await r.ReadAsync(ct))
            return MapearMedico(r);
        return null;
    }

    public async Task ActualizarAsync(Medico medico, CancellationToken ct = default)
    {
        const string sql = @"
            UPDATE medicos SET v_nombres = @Nombres, v_apellidos = @Apellidos, 
            v_numero_colegiatura = @Colegiatura, v_especialidad = @Especialidad,
            v_telefono = @Telefono, v_correo = @Correo, d_fecha_modificacion = GETDATE()
            WHERE i_id = @Id";

        await using var cn = new SqlConnection(_cadenaConexion);
        await cn.OpenAsync(ct);
        await using var cmd = new SqlCommand(sql, cn);
        cmd.Parameters.AddWithValue("@Id", medico.Id);
        cmd.Parameters.AddWithValue("@Nombres", medico.Nombres);
        cmd.Parameters.AddWithValue("@Apellidos", medico.Apellidos);
        cmd.Parameters.AddWithValue("@Colegiatura", medico.NumeroColegiatura);
        cmd.Parameters.AddWithValue("@Especialidad", medico.Especialidad);
        cmd.Parameters.AddWithValue("@Telefono", (object?)medico.Telefono ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Correo", (object?)medico.Correo ?? DBNull.Value);
        await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task EliminarAsync(int id, CancellationToken ct = default)
    {
        await using var cn = new SqlConnection(_cadenaConexion);
        await cn.OpenAsync(ct);
        await using var cmd = new SqlCommand("DELETE FROM medicos WHERE i_id = @Id", cn);
        cmd.Parameters.AddWithValue("@Id", id);
        await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task<(IEnumerable<Medico> Data, int Total)> ObtenerGrillaAsync(int pagina, int tamanioPagina, string? filtro, CancellationToken ct = default)
    {
        var lista = new List<Medico>();

        string sqlBase = "FROM medicos WHERE (@Filtro IS NULL OR v_nombres LIKE '%' + @Filtro + '%' OR v_apellidos LIKE '%' + @Filtro + '%' OR v_especialidad LIKE '%' + @Filtro + '%')";

        await using var cn = new SqlConnection(_cadenaConexion);
        await cn.OpenAsync(ct);

        await using var cmdTotal = new SqlCommand($"SELECT COUNT(*) {sqlBase}", cn);
        cmdTotal.Parameters.AddWithValue("@Filtro", (object?)filtro ?? DBNull.Value);
        int total = (int)await cmdTotal.ExecuteScalarAsync(ct);

        await using var cmdDatos = new SqlCommand(
            $"SELECT i_id, v_nombres, v_apellidos, v_numero_colegiatura, v_especialidad, v_telefono, v_correo, b_activo {sqlBase} ORDER BY i_id DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY", cn);
        cmdDatos.Parameters.AddWithValue("@Filtro", (object?)filtro ?? DBNull.Value);
        cmdDatos.Parameters.AddWithValue("@Offset", (pagina - 1) * tamanioPagina);
        cmdDatos.Parameters.AddWithValue("@PageSize", tamanioPagina);

        using var r = await cmdDatos.ExecuteReaderAsync(ct);
        while (await r.ReadAsync(ct))
            lista.Add(MapearMedico(r));

        return (lista, total);
    }

    private static Medico MapearMedico(SqlDataReader r) => new()
    {
        Id = r.GetInt32(0),
        Nombres = r.GetString(1),
        Apellidos = r.GetString(2),
        NumeroColegiatura = r.GetString(3),
        Especialidad = r.GetString(4),
        Telefono = r.IsDBNull(5) ? null : r.GetString(5),
        Correo = r.IsDBNull(6) ? null : r.GetString(6),
        BActivo = r.GetBoolean(7)
    };
}
