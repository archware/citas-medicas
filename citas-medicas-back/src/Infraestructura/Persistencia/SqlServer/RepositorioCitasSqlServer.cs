using Aplicacion.CasosUso.Citas.Consultas.ObtenerCitas;
using Aplicacion.CasosUso.Citas.Puertos;
using Dominio.Citas;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Infraestructura.Persistencia.SqlServer;

internal sealed class RepositorioCitasSqlServer : IRepositorioCitas
{
    private readonly string _connectionString;

    public RepositorioCitasSqlServer(string connectionString)
        => _connectionString = connectionString;

    public async Task<int> GuardarAsync(Cita cita, CancellationToken cancellationToken)
    {
        const string sql = @"
            INSERT INTO citas (i_id_paciente, i_id_medico, d_fecha_hora, v_motivo, v_estado, v_id_idempotencia)
            OUTPUT INSERTED.i_id
            VALUES (@idPaciente, @idMedico, @fechaHora, @motivo, @estado, @idIdem)";

        await using var cn = new SqlConnection(_connectionString);
        await cn.OpenAsync(cancellationToken);
        await using var cmd = new SqlCommand(sql, cn);
        cmd.Parameters.AddWithValue("@idPaciente", cita.IdPaciente);
        cmd.Parameters.AddWithValue("@idMedico",   cita.IdMedico);
        cmd.Parameters.AddWithValue("@fechaHora",  cita.FechaHora);
        cmd.Parameters.AddWithValue("@motivo",     cita.Motivo);
        cmd.Parameters.AddWithValue("@estado",     cita.Estado.ToString().ToUpperInvariant());
        cmd.Parameters.AddWithValue("@idIdem",     cita.IdIdempotencia);
        return (int)(await cmd.ExecuteScalarAsync(cancellationToken))!;
    }

    public async Task<Cita?> ObtenerPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        const string sql = @"
            SELECT i_id, i_id_paciente, i_id_medico, d_fecha_hora, v_motivo, v_estado, v_id_idempotencia, v_diagnostico, v_tratamiento
            FROM citas WHERE i_id = @Id";
        
        await using var cn = new SqlConnection(_connectionString);
        await cn.OpenAsync(cancellationToken);
        await using var cmd = new SqlCommand(sql, cn);
        cmd.Parameters.AddWithValue("@Id", id);
        
        using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
        if (await reader.ReadAsync(cancellationToken))
        {
            var cita = Cita.Registrar(
                reader.GetInt32(1),
                reader.GetInt32(2),
                reader.GetDateTime(3),
                reader.GetString(4),
                reader.GetString(6)
            );
            
            var estadoStr = reader.GetString(5);
            var estado = Enum.Parse<EstadoCita>(estadoStr, true);
            
            var diagnostico = reader.IsDBNull(7) ? null : reader.GetString(7);
            var tratamiento = reader.IsDBNull(8) ? null : reader.GetString(8);
            
            var propId = typeof(Cita).GetProperty(nameof(Cita.Id));
            if (propId != null) propId.SetValue(cita, reader.GetInt32(0));
            
            var propEstado = typeof(Cita).GetProperty(nameof(Cita.Estado));
            if (propEstado != null) propEstado.SetValue(cita, estado);
            
            var propDiagnostico = typeof(Cita).GetProperty(nameof(Cita.Diagnostico));
            if (propDiagnostico != null) propDiagnostico.SetValue(cita, diagnostico);
            
            var propTratamiento = typeof(Cita).GetProperty(nameof(Cita.Tratamiento));
            if (propTratamiento != null) propTratamiento.SetValue(cita, tratamiento);
            
            return cita;
        }
        return null;
    }

    public async Task ActualizarAsync(Cita cita, CancellationToken cancellationToken = default)
    {
        const string sql = @"
            UPDATE citas 
            SET d_fecha_hora = @fechaHora, v_motivo = @motivo, v_estado = @estado, v_diagnostico = @diagnostico, v_tratamiento = @tratamiento
            WHERE i_id = @id";
            
        await using var cn = new SqlConnection(_connectionString);
        await cn.OpenAsync(cancellationToken);
        await using var cmd = new SqlCommand(sql, cn);
        cmd.Parameters.AddWithValue("@id", cita.Id);
        cmd.Parameters.AddWithValue("@fechaHora", cita.FechaHora);
        cmd.Parameters.AddWithValue("@motivo", cita.Motivo);
        cmd.Parameters.AddWithValue("@estado", cita.Estado.ToString().ToUpperInvariant());
        cmd.Parameters.AddWithValue("@diagnostico", (object?)cita.Diagnostico ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@tratamiento", (object?)cita.Tratamiento ?? DBNull.Value);
        
        await cmd.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task<bool> VerificarChoqueHorarioAsync(int idMedico, DateTime fechaHora, CancellationToken cancellationToken = default)
    {
        const string sql = @"
            SELECT COUNT(1) FROM citas 
            WHERE i_id_medico = @idMedico AND v_estado != 'CANCELADA' 
            AND d_fecha_hora >= @inicio AND d_fecha_hora < @fin";
            
        await using var cn = new SqlConnection(_connectionString);
        await cn.OpenAsync(cancellationToken);
        await using var cmd = new SqlCommand(sql, cn);
        
        var inicio = fechaHora.AddMinutes(-30);
        var fin = fechaHora.AddMinutes(30);
        
        cmd.Parameters.AddWithValue("@idMedico", idMedico);
        cmd.Parameters.AddWithValue("@inicio", inicio);
        cmd.Parameters.AddWithValue("@fin", fin);
        
        var count = (int)await cmd.ExecuteScalarAsync(cancellationToken);
        return count > 0;
    }

    public async Task<(IEnumerable<CitaResumen> Data, int Total)> ObtenerGrillaAsync(int pagina, int tamanioPagina, int? idPaciente, int? idMedico, DateTime? fecha, string? estado, CancellationToken ct = default)
    {
        var lista = new List<CitaResumen>();
        int total = 0;

        string sqlBase = "FROM citas c JOIN pacientes p ON c.i_id_paciente = p.i_id JOIN medicos m ON c.i_id_medico = m.i_id WHERE (@IdPaciente IS NULL OR c.i_id_paciente = @IdPaciente) AND (@IdMedico IS NULL OR c.i_id_medico = @IdMedico) AND (@Fecha IS NULL OR CONVERT(date, c.d_fecha_hora) = @Fecha) AND (@Estado IS NULL OR c.v_estado = @Estado)";
        
        await using var cn = new SqlConnection(_connectionString);
        await cn.OpenAsync(ct);
        
        await using var cmdTotal = new SqlCommand($"SELECT COUNT(*) {sqlBase}", cn);
        cmdTotal.Parameters.AddWithValue("@IdPaciente", (object?)idPaciente ?? DBNull.Value);
        cmdTotal.Parameters.AddWithValue("@IdMedico", (object?)idMedico ?? DBNull.Value);
        cmdTotal.Parameters.AddWithValue("@Fecha", (object?)fecha?.Date ?? DBNull.Value);
        cmdTotal.Parameters.AddWithValue("@Estado", (object?)estado?.ToUpperInvariant() ?? DBNull.Value);
        
        total = (int)await cmdTotal.ExecuteScalarAsync(ct);
        
        await using var cmdDatos = new SqlCommand($@"
            SELECT c.i_id, c.i_id_paciente, p.v_nombres + ' ' + p.v_apellidos as Paciente,
                   c.i_id_medico, m.v_nombres + ' ' + m.v_apellidos as Medico,
                   c.d_fecha_hora, c.v_motivo, c.v_estado, c.v_diagnostico, c.v_tratamiento
            {sqlBase}
            ORDER BY c.d_fecha_hora DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY", cn);
            
        cmdDatos.Parameters.AddWithValue("@IdPaciente", (object?)idPaciente ?? DBNull.Value);
        cmdDatos.Parameters.AddWithValue("@IdMedico", (object?)idMedico ?? DBNull.Value);
        cmdDatos.Parameters.AddWithValue("@Fecha", (object?)fecha?.Date ?? DBNull.Value);
        cmdDatos.Parameters.AddWithValue("@Estado", (object?)estado?.ToUpperInvariant() ?? DBNull.Value);
        cmdDatos.Parameters.AddWithValue("@Offset", (pagina - 1) * tamanioPagina);
        cmdDatos.Parameters.AddWithValue("@PageSize", tamanioPagina);
        
        using var lector = await cmdDatos.ExecuteReaderAsync(ct);
        while (await lector.ReadAsync(ct))
        {
            lista.Add(new CitaResumen(
                lector.GetInt32(0), lector.GetInt32(1), lector.GetString(2),
                lector.GetInt32(3), lector.GetString(4),
                lector.GetDateTime(5), lector.GetString(6), lector.GetString(7),
                lector.IsDBNull(8) ? null : lector.GetString(8),
                lector.IsDBNull(9) ? null : lector.GetString(9)));
        }
        
        return (lista, total);
    }
}
