using Aplicacion.Comun.Interfaces.Seguridad;
using OtpNet;
using System.Security.Cryptography;

namespace Infraestructura.Servicios.Seguridad;

internal sealed class ServicioMfaOtp : IServicioMfa
{
    public string GenerarSecreto()
    {
        var clave = KeyGeneration.GenerateRandomKey(20);
        return Base32Encoding.ToString(clave);
    }

    public bool ValidarCodigo(string secreto, string codigo)
    {
        var bytesClave = Base32Encoding.ToBytes(secreto);
        var totp = new Totp(bytesClave);
        return totp.VerifyTotp(codigo, out _, new VerificationWindow(previous: 1, future: 1));
    }

    public string GenerarCodigoRecuperacion()
        => $"{RandomNumberGenerator.GetInt32(100000000):D8}";
}
