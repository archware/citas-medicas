using System;
using System.Data.SqlClient;
class Program {
    static void Main() {
        string cs = "Server=127.0.0.1,14330;Database=citas_medicas;User Id=sa;Password=Fzz5WsNI7nP3rM7DIjgN3GSGREfAeFoulA632QQMfRtTpzHEOAa7;TrustServerCertificate=True;Encrypt=False;";
        try {
            using var conn = new SqlConnection(cs);
            conn.Open();
            using var cmd = new SqlCommand("SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE';", conn);
            using var reader = cmd.ExecuteReader();
            while(reader.Read()) {
                Console.WriteLine(reader[0] + "." + reader[1]);
            }
        } catch (Exception ex) {
            Console.WriteLine(ex.Message);
        }
    }
}
