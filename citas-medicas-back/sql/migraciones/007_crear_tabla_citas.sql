-- Migración: Crear tabla citas
-- Identificador: ECO-20260908-007
-- Fecha: 2026-09-08

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'citas')
BEGIN
    CREATE TABLE citas (
        i_id            INT            IDENTITY(1,1) NOT NULL,
        i_id_paciente   INT            NOT NULL,
        i_id_medico     INT            NOT NULL,
        d_fecha_hora    DATETIME2      NOT NULL,
        v_motivo        NVARCHAR(500)  NOT NULL,
        v_estado        VARCHAR(20)    NOT NULL DEFAULT 'PROGRAMADA',
        v_id_idempotencia VARCHAR(50)  NOT NULL,
        d_fecha_registro   DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
        v_usuario_registro VARCHAR(160) NULL,
        d_fecha_modificacion DATETIME2 NULL,
        v_usuario_modificacion VARCHAR(160) NULL,
        CONSTRAINT PK_citas PRIMARY KEY CLUSTERED (i_id),
        CONSTRAINT FK_citas_paciente FOREIGN KEY (i_id_paciente) REFERENCES pacientes (i_id),
        CONSTRAINT FK_citas_medico FOREIGN KEY (i_id_medico) REFERENCES medicos (i_id),
        CONSTRAINT UQ_citas_idempotencia UNIQUE (v_id_idempotencia)
    );
END
GO
