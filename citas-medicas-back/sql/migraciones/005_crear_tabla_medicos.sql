-- Migración: Crear tabla medicos
-- Identificador: ECO-20260908-005
-- Fecha: 2026-09-08

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'medicos')
BEGIN
    CREATE TABLE medicos (
        i_id            INT            IDENTITY(1,1) NOT NULL,
        v_nombres       NVARCHAR(200)  NOT NULL,
        v_apellidos     NVARCHAR(200)  NOT NULL,
        v_numero_colegiatura VARCHAR(50) NOT NULL,
        v_especialidad  NVARCHAR(100)  NOT NULL,
        v_telefono      VARCHAR(20)    NULL,
        v_correo        VARCHAR(200)   NULL,
        d_fecha_registro   DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
        v_usuario_registro VARCHAR(160) NULL,
        d_fecha_modificacion DATETIME2 NULL,
        v_usuario_modificacion VARCHAR(160) NULL,
        b_activo        BIT            NOT NULL DEFAULT 1,
        CONSTRAINT PK_medicos PRIMARY KEY CLUSTERED (i_id),
        CONSTRAINT UQ_medicos_colegiatura UNIQUE (v_numero_colegiatura)
    );
END
GO
