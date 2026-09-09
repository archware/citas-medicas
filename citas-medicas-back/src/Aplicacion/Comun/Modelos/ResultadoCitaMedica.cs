namespace Aplicacion.Comun.Modelos;

public interface ResultadoCitaMedica
{
    int StatusCode { get; set; }
    bool HasSucceeded { get; }
}

public interface ResultadoCitaMedica<T> : ResultadoCitaMedica
{
    T? Value { get; }
}

public class ExitoCitaMedica : ResultadoCitaMedica
{
    public int StatusCode { get; set; } = 200;
    public bool HasSucceeded => DetalleErrorCitaMedica == null;
    public ErrorCitaMedica? DetalleErrorCitaMedica { get; set; }
}

public class ExitoCitaMedica<T> : ResultadoCitaMedica<T>
{
    public ExitoCitaMedica() { }
    public ExitoCitaMedica(T value) => Value = value;
    
    public int StatusCode { get; set; } = 200;
    public bool HasSucceeded => DetalleErrorCitaMedica == null;
    public ErrorCitaMedica? DetalleErrorCitaMedica { get; set; }
    public T? Value { get; set; }
}

public class ErrorCitaMedica<T> : ResultadoCitaMedica<T>
{
    public ErrorCitaMedica(string message)
    {
        DetalleErrorCitaMedica = new ErrorCitaMedica("ERROR", message);
    }
    
    public int StatusCode { get; set; } = 400;
    public bool HasSucceeded => false;
    public ErrorCitaMedica? DetalleErrorCitaMedica { get; set; }
    public T? Value { get; set; }
}

public class ResultadoGrilla<T>
{
    private int _tamanioPagina = 10;
    private int _totalRegistros;

    public int TotalPaginas
    {
        get => _tamanioPagina > 0 ? (int)Math.Ceiling((double)_totalRegistros / _tamanioPagina) : 0;
        set => _tamanioPagina = value > 0 ? value : 10;
    }

    public int TotalRegistros
    {
        get => _totalRegistros;
        set => _totalRegistros = value;
    }

    public T? Data { get; set; }
}

public class ErrorCitaMedica
{
    public ErrorCitaMedica(string errorCode, string message)
    {
        ErrorCode = errorCode;
        Message = message;
    }
    public string ErrorCode { get; set; }
    public string Message { get; set; }
}


