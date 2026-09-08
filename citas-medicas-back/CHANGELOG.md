# Changelog — citas-medicas-back

## [0.1.0] — 2026-09-07

### Añadido
- Scaffold desde 10022024-BASE-WEB OID e15a156333b7e2dac4976ef4e3e775dc769979e0.
- Adaptado para SQL Server (Microsoft.Data.SqlClient en lugar de Npgsql).
- .gitignore, AGENTS.md, LESSONS_LEARNED.md, docs/CONTINUIDAD_AGENTES.md.
- Directory.Build.props: TreatWarningsAsErrors=true, Deterministic=true.
- Compilación verificada: 0 errores, 0 advertencias.
- Identificador asignado: ECO-20260907-001.

## [0.2.0] — 2026-09-08

### Añadido
- **Infraestructura transversal (Nivel 1)**: Filtros de excepción, pipeline de MediatR (Validación, Rendimiento, BD, Excepción No Controlada, Autorización), entidades auditable y base.
- **Módulo de seguridad (Nivel 2)**: Entidades (Usuario, TokenRefresco), interfaces, AutenticacionController.
- **Casos de Uso Autenticación**: IniciarSesion, RenovarToken, CerrarSesion, ObtenerPerfil implementados con MediatR.
- Identificador asignado: ECO-20260908-001 (Alineación con Doctrina v1.5.3).

## [0.3.0] — 2026-09-08 (Alineación Estricta Doctrina)

### Modificado
- **Convención de Nombres**: Se eliminaron los prefijos CitasMedicas.* de todas las carpetas, proyectos (.csproj) y namespaces. La arquitectura ahora es puramente Dominio, Aplicacion, Infraestructura y WebApi.
- **Controladores Puros**: Se refactorizó AutenticacionController para aplicar estrictamente la regla de "Sólo delega". Los controladores ya no verifican el éxito de la operación; solo hacen Ok(await Mediator.Send(comando)).
- **Resultados Tipados Puros**: Se reemplazó el contenedor ResultadoAutenticacion<T> por DTOs directos y excepciones específicas (como RestExcepcion), las cuales son atrapadas nativamente por FiltroExcepcionApiAttribute y convertidas a ProblemDetails estándar (RFC 7231).
- **Convención de ViewModels**: Se renombraron las clases de comando y consulta de MediatR de *Comando y *Consulta a la convención canónica del chasis *VM (e.g. IniciarSesionVM).

### Añadido
- **Swagger**: Se agregó el paquete Swashbuckle.AspNetCore (v10.2.3) al proyecto WebApi y se inyectó en el pipeline de la aplicación, exponiendo la documentación correctamente en /swagger/index.html.

## [0.4.0] — 2026-09-08 (Restauración IOutcome)

### Modificado
- **IOutcome canónico**: Todos los manejadores de MediatR ahora devuelven `IOutcome<T>` en lugar de DTOs planos. Se eliminaron las excepciones de negocio (`RestExcepcion`) del flujo de autenticación; los errores de validación y negocio viajan como `SuccessResult<T>` con `detailError` y `StatusCode` explícito.
- **Controladores al estilo SGP_BE**: `AutenticacionController` replicó fielmente el patrón `var r = await Mediator.Send(comando); return StatusCode(r.StatusCode, r);` del chasis original.
- **Claim scope=plataforma**: Se añadió el claim `scope` al JWT generado por `IniciarSesionManejador` y `RenovarTokenManejador` para satisfacer la validación del `AuthStore` Angular.
- **ValidacionComportamiento**: Ahora intercepta y empaqueta fallos de FluentValidation como `IOutcome` con status 422 cuando el tipo de respuesta lo soporta.
- Identificador asignado: ECO-20260908-002.

## [0.5.0] — 2026-09-08 (Vertical de Pacientes)

### Añadido
- **Entidad Paciente** (`Dominio/Entidades/Paciente.cs`): Entidad rica con factory `Registrar`, hereda de `EntidadAuditable`.
- **Puerto IRepositorioPacientes** (`Aplicacion/CasosUso/Pacientes/Puertos/IRepositorioPacientes.cs`).
- **RegistrarPacienteVM / RegistrarPacienteManejador**: Comando CQRS para crear pacientes; devuelve `IOutcome<int>`.
- **ObtenerPacientesVM / ObtenerPacientesManejador**: Consulta CQRS para listar pacientes; devuelve `IOutcome<IEnumerable<PacienteDto>>`.
- **RepositorioPacientesSqlServer**: Implementación ADO.NET nativa con `SqlCommand`/`SqlDataReader`, sin Dapper ni micro-ORM.
- **PacientesController**: Controlador ultra-fino en `api/v1/plataforma/pacientes` con GET y POST.
- **Migración SQL** (`sql/migraciones/003_crear_tabla_pacientes.sql`): Tabla `pacientes` con PK, UQ documento y campos de auditoría.
- Identificador asignado: ECO-20260908-003.
- Compilación verificada: 0 errores, 0 advertencias.

## [0.6.0] — 2026-09-08 (Alineación SGP_BE y Desacoplamiento)

### Modificado
- **Refactorización de Nombres**: Se aplicó de forma estricta el lenguaje ubicuo en español. Todos los `*Manejador` fueron renombrados a `*Handler` (alineado a SGP_BE e `IRequestHandler`). Los sufijos anglosajones `Dto` fueron eliminados a favor de nombres como `*Respuesta` o `*Resumen` (e.g. `IniciarSesionRespuesta`).
- **Módulo Citas**: Migrado de la carpeta raíz `Aplicacion/Citas` hacia el estándar `Aplicacion/CasosUso/Citas`. Sus comandos y consultas fueron renombrados al sufijo canónico `*VM` (e.g. `RegistrarCitaVM`).
- **Controladores**: Renombramiento físico de la carpeta `Controllers` a `Controladores`.
- **Desacoplamiento JWT**: La lógica de generación y firma del JWT fue extraída del `IniciarSesionHandler` y `RenovarTokenHandler` hacia un nuevo servicio `ServicioTokenJwt` en la capa de Infraestructura, inyectado mediante `IServicioTokenJwt`.

### Añadido
- **ResultadoGrilla<T>** (`IOutcome.cs`): Implementación fiel del patrón `ResultGrid<T>` de SGP_BE adaptado a la doctrina en español, el cual calcula dinámicamente `TotalPaginas`.
- **Listado Pacientes con SP**: Migración `004_sp_listado_pacientes.sql` con el Stored Procedure `USP_SEL_LISTADO_PACIENTES`. `RepositorioPacientesSqlServer` ejecuta este SP vía ADO.NET (cumpliendo la Ley B) procesando parámetros `OUTPUT` para mapear de vuelta a `ResultadoGrilla<T>`.
- Identificador asignado: ECO-20260908-005.
