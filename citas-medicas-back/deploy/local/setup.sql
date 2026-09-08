-- Script de inicializacion de la base de datos y usuario de aplicacion.
-- Se ejecuta una sola vez despues de que SQL Server arranque.
-- Uso: sqlcmd -S localhost,14350 -U sa -P <SA_PASSWORD> -i setup.sql

-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'citas_medicas')
BEGIN
    CREATE DATABASE citas_medicas;
END
GO

USE citas_medicas;
GO

-- Crear el esquema de control
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'controles')
    EXEC('CREATE SCHEMA controles');
GO

-- Crear el login y usuario de aplicacion si no existen
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'citas_app')
BEGIN
    CREATE LOGIN citas_app WITH PASSWORD = '$(CITAS_APP_PASSWORD)';
END
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'citas_app')
BEGIN
    CREATE USER citas_app FOR LOGIN citas_app;
END
GO

-- Permisos minimos para la aplicacion
GRANT SELECT, INSERT, UPDATE ON SCHEMA::dbo      TO citas_app;
GRANT SELECT, INSERT         ON SCHEMA::controles TO citas_app;
GO
