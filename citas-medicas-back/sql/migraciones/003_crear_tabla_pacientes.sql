-- Migración: Crear tabla pacientes
-- Identificador: ECO-20260908-003
-- Fecha: 2026-09-08

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pacientes')
BEGIN
    CREATE TABLE pacientes (
        i_id            INT            IDENTITY(1,1) NOT NULL,
        v_nombres       NVARCHAR(200)  NOT NULL,
        v_apellidos     NVARCHAR(200)  NOT NULL,
        v_numero_documento VARCHAR(20) NOT NULL,
        v_telefono      VARCHAR(20)    NULL,
        v_correo        VARCHAR(200)   NULL,
        d_fecha_nacimiento DATE        NOT NULL,
        d_fecha_registro   DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
        v_usuario_registro VARCHAR(160) NULL,
        d_fecha_modificacion DATETIME2 NULL,
        v_usuario_modificacion VARCHAR(160) NULL,
        CONSTRAINT PK_pacientes PRIMARY KEY CLUSTERED (i_id),
        CONSTRAINT UQ_pacientes_documento UNIQUE (v_numero_documento)
    );
END
GO
