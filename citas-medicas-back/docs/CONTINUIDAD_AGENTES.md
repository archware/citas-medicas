---
title: "Continuidad para agentes del backend de gestion de citas medicas"
date: "2026-09-08"
version: "1.4.0"
change_id: "ECO-20260908-005"
---

# Continuidad para agentes

## Proposito y limites

Backend REST API hexagonal + CQRS para gestion de citas medicas. SQL Server
como motor de datos. Arquitectura pura en 4 capas estrictas sin prefijos: Dominio, Aplicacion,
Infraestructura, WebApi.

## Fuentes de verdad (en orden)

1. C:\Users\cotaha\Documents\Repos2\DOCTRINA_MAESTRA_UNIFICADA.md
2. C:\Users\cotaha\Documents\Repos2\ESTANDAR_DOCUMENTAL_AGENTES.md
3. C:\Users\cotaha\source\repos\AGENTS.md (raiz)
4. AGENTS.md de este repositorio
5. Este documento
6. CHANGELOG.md y LESSONS_LEARNED.md

## Estado actual (2026-09-08)

| Aspecto | Estado |
|---|---|
| Fase | Autenticacion + Vertical de Pacientes completados y refactorizados |
| Compilacion | 0 errores, 0 advertencias |
| Base de datos | SQL Server — docker citas_medicas en puerto 14330, migraciones 001 a 004 (SP pacientes) aplicadas |
| Swagger | Funcional en /swagger/index.html |
| Autenticacion | Handlers de Auth desacoplados (`IServicioTokenJwt`) |
| Pacientes | GET lista usando SP (`USP_SEL_LISTADO_PACIENTES`) mapeado hacia `ResultadoGrilla<T>` |
| Frontend | Vistas con Atomic Signals consumiendo servicios. |

## Patron de respuesta: IOutcome y Grillas

Todo handler MediatR DEBE devolver `IOutcome` o `IOutcome<T>`. 
Para respuestas de grillas, usar `ResultadoGrilla<T>`:
```csharp
var grilla = new ResultadoGrilla<IEnumerable<PacienteResumen>>
{
    TotalPaginas = solicitud.TamanioPagina, 
    TotalRegistros = resultado.Total,
    Data = resumenes
};
return new SuccessResult<ResultadoGrilla<IEnumerable<PacienteResumen>>>(grilla);
```

Los controladores SIEMPRE devuelven:
```csharp
var r = await Mediator.Send(comando);
return StatusCode(r.StatusCode, r);
```

## Nomenclatura Estricta

1. Las peticiones a MediatR llevan sufijo `*VM` (e.g. `RegistrarPacienteVM`).
2. Las clases que implementan MediatR llevan sufijo `*Handler` (e.g. `RegistrarPacienteHandler`).
3. DTOs: No usar la palabra `Dto`, usar sustantivos funcionales `*Resumen`, `*Respuesta`.
4. Carpetas y variables: **Todo en español**, excepto `*Handler` y `*VM`. (ej. `Controladores` en vez de `Controllers`).

## Patron de acceso a datos: ADO.NET nativo (Ley B)

**Dapper esta PROHIBIDO.** Todos los repositorios usan `SqlCommand` puro.
Para llamadas a Stored Procedures paginados (como listados), usar `CommandType.StoredProcedure` e inyectar el parámetro `@TotalRegistros` con `Direction = ParameterDirection.Output` para que el `ResultadoGrilla` pueda calcular las páginas.

## Como continuar

1. `git status --short --branch` antes de cualquier cambio.
2. Detener el backend antes de ejecutar `dotnet build` para evitar bloqueos MSB3027 (revisar LESSONS_LEARNED.md L-007).
3. Siguiente paso: Probar la integración de `ResultadoGrilla` en el frontend, y continuar con Vertical de Medicos.
