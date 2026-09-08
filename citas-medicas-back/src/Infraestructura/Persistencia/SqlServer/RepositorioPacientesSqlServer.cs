using Aplicacion.CasosUso.Pacientes.Puertos;
using Dominio.Entidades;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace Infraestructura.Persistencia.SqlServer;

internal sealed class RepositorioPacientesSqlServer : IRepositorioPacientes
{
    private readonly string _cadenaConexion;

    public RepositorioPacientesSqlServer(IConfiguration configuracion)
    {
        _cadenaConexion = configuracion.GetConnectionString("CitasMedicas") ?? string.Empty;
    }

    public async Task<Paciente?> ObtenerPorIdAsync(int id, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "SELECT i_id, v_nombres, v_apellidos, v_numero_documento, v_telefono, v_correo, d_fecha_nacimiento, v_genero, v_direccion " +
            "FROM pacientes WHERE i_id = @Id", conexion);
        comando.Parameters.Add("@Id", SqlDbType.Int).Value = id;

        await conexion.OpenAsync(ct);
        using var lector = await comando.ExecuteReaderAsync(ct);

        if (await lector.ReadAsync(ct))
        {
            return MapearPaciente(lector);
        }
        return null;
    }

    public async Task<IEnumerable<Paciente>> ObtenerTodosAsync(CancellationToken ct = default)
    {
        var lista = new List<Paciente>();
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "SELECT i_id, v_nombres, v_apellidos, v_numero_documento, v_telefono, v_correo, d_fecha_nacimiento, v_genero, v_direccion " +
            "FROM pacientes ORDER BY i_id DESC", conexion);

        await conexion.OpenAsync(ct);
        using var lector = await comando.ExecuteReaderAsync(ct);

        while (await lector.ReadAsync(ct))
        {
            lista.Add(MapearPaciente(lector));
        }
        return lista;
    }

    public async Task<(IEnumerable<Paciente> Data, int Total)> ObtenerGrillaAsync(int pagina, int tamanioPagina, string? nombre, string? documento, CancellationToken ct = default)
    {
        var lista = new List<Paciente>();
        int total = 0;

        using var conexion = new SqlConnection(_cadenaConexion);
        
        string sqlBase = "FROM pacientes WHERE (@Nombre IS NULL OR v_nombres LIKE '%' + @Nombre + '%' OR v_apellidos LIKE '%' + @Nombre + '%') AND (@Documento IS NULL OR v_numero_documento LIKE '%' + @Documento + '%')";
        
        using var comandoTotal = new SqlCommand($"SELECT COUNT(*) {sqlBase}", conexion);
        comandoTotal.Parameters.Add("@Nombre", SqlDbType.NVarChar, 100).Value = (object?)nombre ?? DBNull.Value;
        comandoTotal.Parameters.Add("@Documento", SqlDbType.NVarChar, 20).Value = (object?)documento ?? DBNull.Value;
        
        await conexion.OpenAsync(ct);
        total = (int)await comandoTotal.ExecuteScalarAsync(ct);

        using var comandoDatos = new SqlCommand(
            $"SELECT i_id, v_nombres, v_apellidos, v_numero_documento, v_telefono, v_correo, d_fecha_nacimiento, v_genero, v_direccion {sqlBase} ORDER BY i_id DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY", conexion);
        
        comandoDatos.Parameters.Add("@Nombre", SqlDbType.NVarChar, 100).Value = (object?)nombre ?? DBNull.Value;
        comandoDatos.Parameters.Add("@Documento", SqlDbType.NVarChar, 20).Value = (object?)documento ?? DBNull.Value;
        comandoDatos.Parameters.Add("@Offset", SqlDbType.Int).Value = (pagina - 1) * tamanioPagina;
        comandoDatos.Parameters.Add("@PageSize", SqlDbType.Int).Value = tamanioPagina;

        using var lector = await comandoDatos.ExecuteReaderAsync(ct);

        while (await lector.ReadAsync(ct))
        {
            lista.Add(MapearPaciente(lector));
        }

        return (lista, total);
    }

    public async Task<int> CrearAsync(Paciente paciente, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "INSERT INTO pacientes (v_nombres, v_apellidos, v_numero_documento, v_telefono, v_correo, d_fecha_nacimiento, v_genero, v_direccion) " +
            "OUTPUT INSERTED.i_id " +
            "VALUES (@Nombres, @Apellidos, @NumeroDocumento, @Telefono, @Correo, @FechaNacimiento, @Genero, @Direccion)", conexion);

        comando.Parameters.Add("@Nombres", SqlDbType.NVarChar, 200).Value = paciente.Nombres;
        comando.Parameters.Add("@Apellidos", SqlDbType.NVarChar, 200).Value = paciente.Apellidos;
        comando.Parameters.Add("@NumeroDocumento", SqlDbType.VarChar, 20).Value = paciente.NumeroDocumento;
        comando.Parameters.Add("@Telefono", SqlDbType.VarChar, 20).Value = paciente.Telefono;
        comando.Parameters.Add("@Correo", SqlDbType.VarChar, 200).Value = paciente.Correo;
        comando.Parameters.Add("@FechaNacimiento", SqlDbType.Date).Value = paciente.FechaNacimiento;
        comando.Parameters.Add("@Genero", SqlDbType.Char, 1).Value = (object?)paciente.Genero ?? DBNull.Value;
        comando.Parameters.Add("@Direccion", SqlDbType.NVarChar, 255).Value = (object?)paciente.Direccion ?? DBNull.Value;

        await conexion.OpenAsync(ct);
        var id = await comando.ExecuteScalarAsync(ct);
        return Convert.ToInt32(id);
    }

    public async Task ActualizarAsync(Paciente paciente, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand(
            "UPDATE pacientes SET v_nombres = @Nombres, v_apellidos = @Apellidos, v_numero_documento = @NumeroDocumento, v_telefono = @Telefono, v_correo = @Correo, d_fecha_nacimiento = @FechaNacimiento, v_genero = @Genero, v_direccion = @Direccion WHERE i_id = @Id", conexion);

        comando.Parameters.Add("@Nombres", SqlDbType.NVarChar, 200).Value = paciente.Nombres;
        comando.Parameters.Add("@Apellidos", SqlDbType.NVarChar, 200).Value = paciente.Apellidos;
        comando.Parameters.Add("@NumeroDocumento", SqlDbType.VarChar, 20).Value = paciente.NumeroDocumento;
        comando.Parameters.Add("@Telefono", SqlDbType.VarChar, 20).Value = paciente.Telefono;
        comando.Parameters.Add("@Correo", SqlDbType.VarChar, 200).Value = paciente.Correo;
        comando.Parameters.Add("@FechaNacimiento", SqlDbType.Date).Value = paciente.FechaNacimiento;
        comando.Parameters.Add("@Genero", SqlDbType.Char, 1).Value = (object?)paciente.Genero ?? DBNull.Value;
        comando.Parameters.Add("@Direccion", SqlDbType.NVarChar, 255).Value = (object?)paciente.Direccion ?? DBNull.Value;
        comando.Parameters.Add("@Id", SqlDbType.Int).Value = paciente.Id;

        await conexion.OpenAsync(ct);
        await comando.ExecuteNonQueryAsync(ct);
    }

    public async Task EliminarAsync(int id, CancellationToken ct = default)
    {
        using var conexion = new SqlConnection(_cadenaConexion);
        using var comando = new SqlCommand("DELETE FROM pacientes WHERE i_id = @Id", conexion);
        comando.Parameters.Add("@Id", SqlDbType.Int).Value = id;

        await conexion.OpenAsync(ct);
        await comando.ExecuteNonQueryAsync(ct);
    }

    private static Paciente MapearPaciente(SqlDataReader lector)
    {
        var paciente = Paciente.Registrar(
            lector.GetString(lector.GetOrdinal("v_nombres")),
            lector.GetString(lector.GetOrdinal("v_apellidos")),
            lector.GetString(lector.GetOrdinal("v_numero_documento")),
            lector.IsDBNull(lector.GetOrdinal("v_telefono")) ? string.Empty : lector.GetString(lector.GetOrdinal("v_telefono")),
            lector.IsDBNull(lector.GetOrdinal("v_correo")) ? string.Empty : lector.GetString(lector.GetOrdinal("v_correo")),
            lector.GetDateTime(lector.GetOrdinal("d_fecha_nacimiento")),
            lector.IsDBNull(lector.GetOrdinal("v_genero")) ? null : lector.GetString(lector.GetOrdinal("v_genero")),
            lector.IsDBNull(lector.GetOrdinal("v_direccion")) ? null : lector.GetString(lector.GetOrdinal("v_direccion"))
        );
        paciente.Id = lector.GetInt32(lector.GetOrdinal("i_id"));
        return paciente;
    }
}
