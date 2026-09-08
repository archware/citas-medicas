# Roadmap: Primer Vertical Core - Pacientes

Identificador: ECO-20260908-003
Responsable: Agente Backend / Frontend
Fecha de apertura: 2026-09-08
Estado: Completado

## Objetivo
Implementar la unidad vertical de "Pacientes", la primera de la triada Pacientes-Medicos-Citas.

## Tareas

1. [x] Crear entidad `Paciente` en `Dominio/Entidades/Paciente.cs`
2. [x] Crear puerto `IRepositorioPacientes` en `Aplicacion/CasosUso/Pacientes/Puertos/`
3. [x] Crear repositorio ADO.NET nativo `RepositorioPacientesSqlServer` en `Infraestructura/Persistencia/SqlServer/`
4. [x] Crear migracion SQL nativa (`sql/migraciones/003_crear_tabla_pacientes.sql`) y aplicarla
5. [x] Crear ViewModels `RegistrarPacienteVM`, `ObtenerPacientesVM` con `IOutcome<T>`
6. [x] Implementar manejadores `RegistrarPacienteManejador`, `ObtenerPacientesManejador`
7. [x] Crear `PacientesController` ultra-fino en `WebApi/Controllers/`
8. [x] Registrar DI en `ExtensionesInyeccionInfraestructura.cs`
9. [x] Compilacion verificada: 0 errores, 0 advertencias
10. [x] Migracion SQL aplicada en la base de datos
11. [x] Backend levantado y sirviendo en https://localhost:60824
12. [x] Actualizar CHANGELOG.md (v0.4.0 IOutcome + v0.5.0 Pacientes)
13. [x] Actualizar docs/CONTINUIDAD_AGENTES.md
14. [x] Actualizar LESSONS_LEARNED.md (L-005, L-006, L-007)

## Siguiente vertical recomendada
- Medicos (entidad, repositorio ADO.NET, VM, manejador, controlador)
