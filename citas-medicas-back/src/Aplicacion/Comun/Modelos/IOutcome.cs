namespace Aplicacion.Comun.Modelos;

public interface IOutcome
{
    int StatusCode { get; set; }
    bool HasSucceeded { get; }
}

public interface IOutcome<T> : IOutcome
{
    T? Value { get; }
}

public class SuccessResult : IOutcome
{
    public int StatusCode { get; set; } = 200;
    public bool HasSucceeded => detailError == null;
    public DetailError? detailError { get; set; }
}

public class SuccessResult<T> : IOutcome<T>
{
    public SuccessResult() { }
    public SuccessResult(T value) => Value = value;
    
    public int StatusCode { get; set; } = 200;
    public bool HasSucceeded => detailError == null;
    public DetailError? detailError { get; set; }
    public T? Value { get; set; }
}

public class ErrorResult<T> : IOutcome<T>
{
    public ErrorResult(string message)
    {
        detailError = new DetailError("ERROR", message);
    }
    
    public int StatusCode { get; set; } = 400;
    public bool HasSucceeded => false;
    public DetailError? detailError { get; set; }
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

public class DetailError
{
    public DetailError(string errorCode, string message)
    {
        ErrorCode = errorCode;
        Message = message;
    }
    public string ErrorCode { get; set; }
    public string Message { get; set; }
}
