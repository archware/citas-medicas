-- ECO-20260907-001 | Esquema inicial de citas medicas
-- Motor: SQL Server | Convencion: columnas con prefijo hungaro minusculo, tablas plural sin prefijo
-- Precondicion: base de datos citas_medicas y esquema controles ya creados por deploy/local/setup.sql

CREATE TABLE dbo.pacientes (
    i_id_paciente  INT           IDENTITY(1,1) NOT NULL,
    v_nombre       VARCHAR(160)  NOT NULL,
    v_dni          VARCHAR(8)    NOT NULL,
    d_nacimiento   DATE          NOT NULL,
    b_activo       BIT           NOT NULL CONSTRAINT df_pacientes_activo DEFAULT 1,
    CONSTRAINT pk_pacientes PRIMARY KEY (i_id_paciente),
    CONSTRAINT uq_pacientes_dni UNIQUE (v_dni)
);

CREATE TABLE dbo.medicos (
    i_id_medico    INT           IDENTITY(1,1) NOT NULL,
    v_nombre       VARCHAR(160)  NOT NULL,
    v_especialidad VARCHAR(80)   NOT NULL,
    v_cmp          VARCHAR(20)   NOT NULL,
    b_activo       BIT           NOT NULL CONSTRAINT df_medicos_activo DEFAULT 1,
    CONSTRAINT pk_medicos PRIMARY KEY (i_id_medico),
    CONSTRAINT uq_medicos_cmp UNIQUE (v_cmp)
);

CREATE TABLE dbo.citas (
    i_id_cita      INT           IDENTITY(1,1) NOT NULL,
    i_id_paciente  INT           NOT NULL,
    i_id_medico    INT           NOT NULL,
    d_fecha_hora   DATETIME2(0)  NOT NULL,
    v_motivo       VARCHAR(500)  NOT NULL,
    v_estado       VARCHAR(20)   NOT NULL CONSTRAINT df_citas_estado DEFAULT 'PROGRAMADA',
    d_creado_en    DATETIME2(0)  NOT NULL CONSTRAINT df_citas_creado DEFAULT SYSUTCDATETIME(),
    v_id_idempotencia VARCHAR(36) NOT NULL,
    CONSTRAINT pk_citas PRIMARY KEY (i_id_cita),
    CONSTRAINT uq_citas_idempotencia UNIQUE (v_id_idempotencia),
    CONSTRAINT fk_citas_paciente FOREIGN KEY (i_id_paciente) REFERENCES dbo.pacientes (i_id_paciente),
    CONSTRAINT fk_citas_medico   FOREIGN KEY (i_id_medico)   REFERENCES dbo.medicos   (i_id_medico),
    CONSTRAINT ck_citas_estado   CHECK (v_estado IN ('PROGRAMADA','CONFIRMADA','CANCELADA','COMPLETADA'))
);

-- Ledger de migraciones (Ley B §5.4)
CREATE TABLE controles.registro_migraciones (
    v_id_migracion      VARCHAR(80)   NOT NULL,
    v_nombre_archivo    VARCHAR(200)  NOT NULL,
    v_sha256            VARCHAR(64)   NOT NULL,
    d_fecha_aplicacion  DATETIME2(0)  NOT NULL CONSTRAINT df_reg_fecha DEFAULT SYSUTCDATETIME(),
    v_version_app       VARCHAR(20)   NOT NULL,
    v_estado            VARCHAR(20)   NOT NULL,
    i_duracion_ms       INT           NOT NULL,
    CONSTRAINT pk_registro_migraciones PRIMARY KEY (v_id_migracion)
);
