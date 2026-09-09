using Aplicacion;
using Infraestructura;
using CITAMEDICA;

var builder = WebApplication.CreateBuilder(args);

// Capas de servicio
builder.Services.AnadirServiciosAplicacion(builder.Configuration);
builder.Services.AnadirInfraestructura(builder.Configuration);
builder.Services.AnadirServiciosCitaMedica(builder.Configuration);

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok());

app.Run();

