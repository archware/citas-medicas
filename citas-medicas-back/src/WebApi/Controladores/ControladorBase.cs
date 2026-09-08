using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controladores;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class ControladorBase : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();
}
