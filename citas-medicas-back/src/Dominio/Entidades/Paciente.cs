using Dominio.Comun;
using System;

namespace Dominio.Entidades;

public sealed class Paciente : EntidadAuditable
{
    public string Nombres { get; private set; } = string.Empty;
    public string Apellidos { get; private set; } = string.Empty;
    public string NumeroDocumento { get; private set; } = string.Empty;
    public string Telefono { get; private set; } = string.Empty;
    public string Correo { get; private set; } = string.Empty;
    public DateTime FechaNacimiento { get; private set; }
    public string? Genero { get; private set; }
    public string? Direccion { get; private set; }
    
    private Paciente() { }

    public static Paciente Registrar(
        string nombres,
        string apellidos,
        string numeroDocumento,
        string telefono,
        string correo,
        DateTime fechaNacimiento,
        string? genero,
        string? direccion)
    {
        if (string.IsNullOrWhiteSpace(nombres)) throw new ArgumentException("Los nombres son obligatorios.");
        if (string.IsNullOrWhiteSpace(apellidos)) throw new ArgumentException("Los apellidos son obligatorios.");
        if (string.IsNullOrWhiteSpace(numeroDocumento)) throw new ArgumentException("El número de documento es obligatorio.");

        return new Paciente
        {
            Nombres = nombres.Trim(),
            Apellidos = apellidos.Trim(),
            NumeroDocumento = numeroDocumento.Trim(),
            Telefono = telefono?.Trim() ?? string.Empty,
            Correo = correo?.Trim() ?? string.Empty,
            FechaNacimiento = fechaNacimiento.Date,
            Genero = genero?.Trim(),
            Direccion = direccion?.Trim()
        };
    }

    public void Actualizar(
        string nombres,
        string apellidos,
        string numeroDocumento,
        string telefono,
        string correo,
        DateTime fechaNacimiento,
        string? genero,
        string? direccion)
    {
        if (string.IsNullOrWhiteSpace(nombres)) throw new ArgumentException("Los nombres son obligatorios.");
        if (string.IsNullOrWhiteSpace(apellidos)) throw new ArgumentException("Los apellidos son obligatorios.");
        if (string.IsNullOrWhiteSpace(numeroDocumento)) throw new ArgumentException("El número de documento es obligatorio.");

        Nombres = nombres.Trim();
        Apellidos = apellidos.Trim();
        NumeroDocumento = numeroDocumento.Trim();
        Telefono = telefono?.Trim() ?? string.Empty;
        Correo = correo?.Trim() ?? string.Empty;
        FechaNacimiento = fechaNacimiento.Date;
        Genero = genero?.Trim();
        Direccion = direccion?.Trim();
    }
}
