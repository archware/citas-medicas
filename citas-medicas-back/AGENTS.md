---
title: "Reglas locales del backend de gestión de citas médicas"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-09-07"
last_updated: "2026-09-08"
document_type: "instruccion para agentes"
status: "vigente"
version: "1.2.0"
canonical_doctrine: "C:\Users\cotaha\Documents\Repos2\DOCTRINA_MAESTRA_UNIFICADA.md"
chasisOrigen: "e15a156333b7e2dac4976ef4e3e775dc769979e0"
chasisNota: "Scaffold limpio desde 10022024-BASE-WEB. Primer commit 8ba45cb."
chasisNivelComun: "e15a156333b7e2dac4976ef4e3e775dc769979e0"
nivelSeguridad: "completo"
---

# Reglas locales del backend de gestión de citas médicas

## Orden obligatorio de lectura

1. C:\Users\cotaha\source\repos\AGENTS.md (raíz del ecosistema);
2. C:\Users\cotaha\Documents\Repos2\DOCTRINA_MAESTRA_UNIFICADA.md;
3. C:\Users\cotaha\Documents\Repos2\ESTANDAR_DOCUMENTAL_AGENTES.md;
4. este archivo;
5. docs/CONTINUIDAD_AGENTES.md de este repositorio;
6. CHANGELOG.md y LESSONS_LEARNED.md.

## Alcance y frontera del producto

Backend REST API para gestión de citas médicas del Hospital Regional de
Ayacucho. Motor de base de datos: SQL Server (Ley B §5.2, columnas con prefijos
húngaros en minúsculas, tablas en plural sin prefijo T_).

## Convenciones de base de datos (ECO-20260907-001)

- Motor: SQL Server con ADO.NET nativo (Microsoft.Data.SqlClient)
- Nombres de tabla: plural minúscula sin prefijo — citas, pacientes, medicos
- Nombres de columna: húngara minúscula — i_id_cita, _nombre, d_fecha_hora
- Esquema principal: dbo durante desarrollo; esquemas dedicados post-MVP
- Scripts de migración: database/scripts/YYYYMMDD_NNN_descripcion.up.sql
- Sin EF Migrations, sin Database.Migrate, sin EnsureCreated

## Arquitectura y Módulo de Seguridad (ECO-20260908-001)

Implementa la arquitectura canónica de Nivel 1 y Nivel 2 según la Ley F de la doctrina maestra v1.5.3:
- Arquitectura de proyectos pura y sin prefijos: Dominio, Aplicacion, Infraestructura y WebApi.
- Autenticación JWT (fail-closed) configurado para "completo".
- Casos de uso de autenticación (IniciarSesion, RenovarToken, CerrarSesion) en español ASCII.
- Los Request de MediatR (comandos/consultas) deben llevar el sufijo canónico *VM (ViewModel) (ej: IniciarSesionVM), siguiendo la doctrina de BASE-WEB.
- Controladores ultrafinos: aplican el principio de "Sólo delega". Usar eturn Ok(await Mediator.Send(comando)) sin comprobaciones de éxito en el controlador.
- Manejo de fallos en Casos de Uso: arrojar Excepciones personalizadas (ej. RestExcepcion) que son capturadas e hidratadas centralmente por FiltroExcepcionApiAttribute hacia el formato ProblemDetails estándar de ASP.NET.

## Prohibiciones operativas

- **Commit, push, merge, rebase** sin autorización expresa del propietario.
- **Despliegues** sin autorización.
- **Escrituras en bases reales** durante auditorías.

## Ciclo obligatorio de trabajo

Antes de editar: registrar rama, OID, git status --short --branch.
Crear o actualizar roadmap en .agents/roadmaps/. Al cierre: actualizar
CHANGELOG.md y LESSONS_LEARNED.md.
