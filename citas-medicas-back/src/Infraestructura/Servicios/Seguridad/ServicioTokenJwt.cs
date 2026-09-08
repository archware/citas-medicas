using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Aplicacion.Comun.Interfaces.Configuracion;
using Aplicacion.Comun.Interfaces.Seguridad;
using Microsoft.IdentityModel.Tokens;

namespace Infraestructura.Servicios.Seguridad;

internal sealed class ServicioTokenJwt : IServicioTokenJwt
{
    private readonly IConfiguracionJwt _configJwt;

    public ServicioTokenJwt(IConfiguracionJwt configJwt)
    {
        _configJwt = configJwt;
    }

    public string GenerarTokenAcceso(int idUsuario, string nombreUsuario, string jwtId, DateTime expiraEn)
    {
        var clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configJwt.Key));
        var credenciales = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, idUsuario.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, nombreUsuario),
            new Claim(JwtRegisteredClaimNames.Jti, jwtId),
            new Claim("scope", "plataforma")
        };

        var token = new JwtSecurityToken(
            issuer: _configJwt.Issuer,
            audience: _configJwt.Audience,
            claims: claims,
            expires: expiraEn,
            signingCredentials: credenciales);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
