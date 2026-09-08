# Lecciones aprendidas — citas-medicas-back

## L-001: El scaffold no incluye bin/obj en el primer commit

El flujo correcto (Ley F §9.3) es: copiar nucleo → renombrar → compilar para
verificar → .gitignore antes del primer git add. Si se compila antes de
tener .gitignore, los artefactos entran al primer commit y hay que usar
git rm --cached para sacarlos.

## L-002: Manejadores MediatR directos (Controladores ultrafinos)

La doctrina estricta de controladores canónicos (donde solo delegan) riñe con
el uso de envoltorios de resultado tipo ResultadoAutenticacion<T> en el controlador. 
Para respetar el diseño "Sólo delega" (eturn Ok(await Mediator.Send(...))),
el manejador de MediatR debe devolver directamente el DTO de respuesta y
arrojar excepciones como RestExcepcion o ValidacionExcepcion para ser capturadas globalmente 
por FiltroExcepcionApiAttribute, construyendo el modelo ProblemDetails nativamente.

## L-003: Nomenclatura de Casos de Uso (ViewModels)

Los objetos de solicitud y comando (Request) de MediatR que llegan desde el controlador 
deben nombrarse utilizando el sufijo *VM (ViewModel) (ej. IniciarSesionVM), 
lo que previene que los frontends desajusten sus payloads al esperar contratos explícitos. 
La ausencia de esta convención provoca desalineación (ej: Angular esperando Username vs Usuario).

## L-004: Swashbuckle.AspNetCore en .NET 10+

El paquete base de Microsoft.AspNetCore.OpenApi en versiones modernas de .NET ya no
trae Swagger UI integrado. Es necesario agregar explícitamente la referencia al
paquete Swashbuckle.AspNetCore (versión 10.2.3 o superior compatible) en el 
archivo Directory.Packages.props y en la capa WebApi, y habilitarlo en 
el ConfigureServices.cs y Program.cs.

## L-005: IOutcome es obligatorio, no opcional

Los agentes anteriores eliminaron el envoltorio `IOutcome` del chasis original y devolvieron
DTOs planos con excepciones para el control de flujo. Esto rompe el contrato con los frontends
del ecosistema que esperan `{ "value": {...}, "statusCode": 200, "hasSucceeded": true }` y
`{ "detailError": { "errorCode": "401", "message": "..." }, "statusCode": 401 }`.
El patrón canónico de SGP_BE y BASE-WEB es:
- Handler devuelve `IOutcome<T>` (nunca arroja excepciones de negocio).
- Controller hace `return StatusCode(r.StatusCode, r)`.

## L-006: El claim scope=plataforma es necesario para el frontend

El `AuthStore` de Angular valida que el JWT contenga `scope=plataforma` antes de
declarar `isAuthenticated = true`. Sin este claim, el token llega al navegador pero
el guard lo rechaza silenciosamente y el usuario se queda en la pantalla de login
sin ningún mensaje de error. Siempre incluir el claim en `IniciarSesionManejador`
y `RenovarTokenManejador`.

## L-007: Detener el backend antes de recompilar

Cuando el backend corre como daemon (`dotnet run`), las DLLs quedan bloqueadas por
el proceso. `dotnet build` falla con MSB3027 después de 10 reintentos. Siempre
matar el task del backend antes de compilar y relanzarlo después.

## L-008: Patrón de Grillas ResultGrid y ADO.NET
Al prescindir del `UnitOfWork` complejo de Entity Framework de `SGP_BE`, la forma nativa y
eficiente (Ley B) de implementar grillas es:
1. SP que devuelve los datos con `OFFSET` y además recibe un parámetro `OUTPUT` para inyectar allí el `COUNT(*)`.
2. Repositorio con `SqlCommand` lee el `ExecuteReaderAsync` normal, y al finalizar recupera el `Value` del parámetro `OUTPUT`.
3. Handler instancia `ResultadoGrilla<T>` asignando `TotalPaginas = pageSize` y `TotalRegistros = output`. La clase automáticamente calcula las páginas internamente.

## L-009: Extracción de Lógica JWT
La instanciación y firma de tokens JWT (`JwtSecurityTokenHandler`) es código de infraestructura, no de aplicación.
Se debe inyectar `IServicioTokenJwt` en los Handlers (como `IniciarSesionHandler`) para mantener los casos de uso puros
y no contaminarlos con bibliotecas criptográficas o `Microsoft.IdentityModel.Tokens`.
