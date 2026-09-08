-- ============================================================
-- DDL: Creacion de la base de datos y tablas
-- ============================================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'citas_medicas')
BEGIN
    CREATE DATABASE citas_medicas;
END
GO

USE citas_medicas;
GO

-- Tabla: usuarios (SEGURIDAD)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usuarios') AND type = 'U')
BEGIN
    CREATE TABLE dbo.usuarios (
        i_id                  INT IDENTITY(1,1) NOT NULL,
        v_nombre_usuario      VARCHAR(160)      NOT NULL,
        v_hash_contrasena     VARCHAR(255)      NOT NULL,
        b_activo              BIT               NOT NULL DEFAULT 1,
        v_correo              VARCHAR(255)      NULL,
        v_nombre_completo     VARCHAR(255)      NULL,
        CONSTRAINT PK_usuarios PRIMARY KEY CLUSTERED (i_id)
    );
END
GO

-- Tabla: tokens_refresco (SEGURIDAD)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.tokens_refresco') AND type = 'U')
BEGIN
    CREATE TABLE dbo.tokens_refresco (
        i_id                  INT IDENTITY(1,1) NOT NULL,
        i_id_usuario          INT               NOT NULL,
        v_token               VARCHAR(100)      NOT NULL,
        v_id_jwt              VARCHAR(100)      NOT NULL,
        d_fecha_creacion      DATETIME2         NOT NULL,
        d_fecha_expiracion    DATETIME2         NOT NULL,
        b_usado               BIT               NOT NULL DEFAULT 0,
        b_revocado            BIT               NOT NULL DEFAULT 0,
        d_fecha_revocacion    DATETIME2         NULL,
        i_id_token_reemplazo  INT               NULL,
        v_ip_creacion         VARCHAR(50)       NULL,
        v_agente_usuario      VARCHAR(500)      NULL,
        CONSTRAINT PK_tokens_refresco PRIMARY KEY CLUSTERED (i_id),
        CONSTRAINT FK_tokens_usuarios FOREIGN KEY (i_id_usuario) REFERENCES dbo.usuarios(i_id)
    );
END
GO

-- Tabla: intentos_login (SEGURIDAD)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.intentos_login') AND type = 'U')
BEGIN
    CREATE TABLE dbo.intentos_login (
        i_id                  INT IDENTITY(1,1) NOT NULL,
        i_id_usuario          INT               NOT NULL,
        i_intentos_fallidos   INT               NOT NULL DEFAULT 0,
        d_fin_bloqueo         DATETIME2         NULL,
        CONSTRAINT PK_intentos_login PRIMARY KEY CLUSTERED (i_id),
        CONSTRAINT FK_intentos_usuarios FOREIGN KEY (i_id_usuario) REFERENCES dbo.usuarios(i_id)
    );
END
GO

-- Tabla: historial_contrasenas (SEGURIDAD)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.historial_contrasenas') AND type = 'U')
BEGIN
    CREATE TABLE dbo.historial_contrasenas (
        i_id                  INT IDENTITY(1,1) NOT NULL,
        i_id_usuario          INT               NOT NULL,
        v_hash_contrasena     VARCHAR(255)      NOT NULL,
        d_fecha_creacion      DATETIME2         NOT NULL,
        CONSTRAINT PK_historial_contrasenas PRIMARY KEY CLUSTERED (i_id),
        CONSTRAINT FK_historial_usuarios FOREIGN KEY (i_id_usuario) REFERENCES dbo.usuarios(i_id)
    );
END
GO

-- Tabla: medicos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.medicos') AND type = 'U')
BEGIN
    CREATE TABLE dbo.medicos (
        i_id                   INT IDENTITY(1,1) NOT NULL,
        v_nombres              NVARCHAR(200)     NOT NULL,
        v_apellidos            NVARCHAR(200)     NOT NULL,
        v_numero_colegiatura   VARCHAR(50)       NULL,       
        v_especialidad         NVARCHAR(100)     NULL,
        v_telefono             VARCHAR(20)       NULL,
        v_correo               VARCHAR(200)      NULL,
        d_fecha_registro       DATETIME2         NULL DEFAULT GETDATE(),
        v_usuario_registro     VARCHAR(160)      NULL,
        d_fecha_modificacion   DATETIME2         NULL,
        v_usuario_modificacion VARCHAR(160)      NULL,
        b_activo               BIT               NOT NULL DEFAULT 1,
        CONSTRAINT PK_medicos PRIMARY KEY CLUSTERED (i_id)
    );
END
GO

-- Tabla: pacientes
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.pacientes') AND type = 'U')
BEGIN
    CREATE TABLE dbo.pacientes (
        i_id                  INT IDENTITY(1,1) NOT NULL,
        v_nombres             NVARCHAR(200)     NOT NULL,
        v_apellidos           NVARCHAR(200)     NOT NULL,
        v_numero_documento    VARCHAR(20)       NOT NULL,
        v_telefono            VARCHAR(20)       NULL,
        v_correo              VARCHAR(200)      NULL,
        d_fecha_nacimiento    DATE              NULL,
        v_genero              CHAR(1)           NULL,       
        v_direccion           NVARCHAR(255)     NULL,
        CONSTRAINT PK_pacientes PRIMARY KEY CLUSTERED (i_id)
    );
END
GO

-- Tabla: citas
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.citas') AND type = 'U')
BEGIN
    CREATE TABLE dbo.citas (
        i_id                INT IDENTITY(1,1) NOT NULL,
        i_id_paciente       INT               NOT NULL,
        i_id_medico         INT               NOT NULL,
        d_fecha_hora        DATETIME          NOT NULL,
        v_motivo            NVARCHAR(500)     NOT NULL,
        v_estado            VARCHAR(20)       NOT NULL DEFAULT 'PROGRAMADA',
        v_id_idempotencia   VARCHAR(50)       NULL,
        v_diagnostico       NVARCHAR(500)     NULL,
        v_tratamiento       NVARCHAR(500)     NULL,
        CONSTRAINT PK_citas PRIMARY KEY CLUSTERED (i_id),
        CONSTRAINT FK_citas_paciente FOREIGN KEY (i_id_paciente) REFERENCES dbo.pacientes(i_id),
        CONSTRAINT FK_citas_medico   FOREIGN KEY (i_id_medico)   REFERENCES dbo.medicos(i_id)
    );
END
GO

-- Indice para verificar choques horarios
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_citas_medico_fecha' AND object_id = OBJECT_ID('dbo.citas'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_citas_medico_fecha
    ON dbo.citas (i_id_medico, d_fecha_hora)
    WHERE v_estado <> 'CANCELADA';
END
GO

-- ============================================================
-- DML: Datos semilla (Prueba)
-- ============================================================
USE citas_medicas;
GO

-- Insercion de usuario administrador (Credenciales: admin / admin123)
SET IDENTITY_INSERT dbo.usuarios ON;
IF NOT EXISTS (SELECT 1 FROM dbo.usuarios WHERE i_id = 1)
    INSERT INTO dbo.usuarios (i_id, v_nombre_usuario, v_hash_contrasena, b_activo, v_nombre_completo)
    VALUES (1, 'admin', '$2a$12$A76oZJrB2ajjN3SeA/YUL.Bb.g4T6FJAa2rXqWgqaX0TxPZFL939q', 1, 'Administrador del Sistema');
SET IDENTITY_INSERT dbo.usuarios OFF;
GO

SET IDENTITY_INSERT dbo.medicos ON;
IF NOT EXISTS (SELECT 1 FROM dbo.medicos WHERE i_id = 1)
    INSERT INTO dbo.medicos (i_id, v_nombres, v_apellidos, v_numero_colegiatura, v_especialidad, v_telefono, v_correo, b_activo, d_fecha_registro)
    VALUES (1, N'Juan',  N'Perez',  '12345', N'Medicina General', '999111222', 'jperez@hospital.pe', 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.medicos WHERE i_id = 2)
    INSERT INTO dbo.medicos (i_id, v_nombres, v_apellidos, v_numero_colegiatura, v_especialidad, v_telefono, v_correo, b_activo, d_fecha_registro)
    VALUES (2, N'Ana',   N'Gomez',  '12346', N'Pediatria',        '999333444', 'agomez@hospital.pe', 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.medicos WHERE i_id = 3)
    INSERT INTO dbo.medicos (i_id, v_nombres, v_apellidos, v_numero_colegiatura, v_especialidad, v_telefono, v_correo, b_activo, d_fecha_registro)
    VALUES (3, N'Luis',  N'Ramos',  '12347', N'Cardiologia',      '999555666', 'lramos@hospital.pe', 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.medicos WHERE i_id = 4)
    INSERT INTO dbo.medicos (i_id, v_nombres, v_apellidos, v_numero_colegiatura, v_especialidad, v_telefono, v_correo, b_activo, d_fecha_registro)
    VALUES (4, N'Maria', N'Torres', '12348', N'Neurologia',       '999777888', 'mtorres@hospital.pe', 1, GETDATE());
SET IDENTITY_INSERT dbo.medicos OFF;
GO

SET IDENTITY_INSERT dbo.pacientes ON;
IF NOT EXISTS (SELECT 1 FROM dbo.pacientes WHERE i_id = 1)
    INSERT INTO dbo.pacientes (i_id, v_nombres, v_apellidos, v_numero_documento, v_telefono, v_correo, d_fecha_nacimiento, v_genero, v_direccion)
    VALUES (1, N'Carlos', N'Mendoza', '12345678', '987654321', 'cmendoza@mail.com', '1990-05-15', 'M', N'Av. Lima 123');
IF NOT EXISTS (SELECT 1 FROM dbo.pacientes WHERE i_id = 2)
    INSERT INTO dbo.pacientes (i_id, v_nombres, v_apellidos, v_numero_documento, v_telefono, v_correo, d_fecha_nacimiento, v_genero, v_direccion)
    VALUES (2, N'Laura', N'Quispe', '87654321', '912345678', 'lquispe@mail.com', '1985-11-20', 'F', N'Jr. Cusco 456');
IF NOT EXISTS (SELECT 1 FROM dbo.pacientes WHERE i_id = 3)
    INSERT INTO dbo.pacientes (i_id, v_nombres, v_apellidos, v_numero_documento, v_telefono, v_correo, d_fecha_nacimiento, v_genero, v_direccion)
    VALUES (3, N'Pedro', N'Huaman', '11223344', '976543210', 'phuaman@mail.com', '2000-03-10', 'M', N'Calle Arequipa 789');
SET IDENTITY_INSERT dbo.pacientes OFF;
GO

SET IDENTITY_INSERT dbo.citas ON;
IF NOT EXISTS (SELECT 1 FROM dbo.citas WHERE i_id = 1)
    INSERT INTO dbo.citas (i_id, i_id_paciente, i_id_medico, d_fecha_hora, v_motivo, v_estado, v_id_idempotencia, v_diagnostico, v_tratamiento)
    VALUES (1, 1, 1, '2026-09-10 09:00:00', N'Control general', 'PROGRAMADA', NEWID(), NULL, NULL);
IF NOT EXISTS (SELECT 1 FROM dbo.citas WHERE i_id = 2)
    INSERT INTO dbo.citas (i_id, i_id_paciente, i_id_medico, d_fecha_hora, v_motivo, v_estado, v_id_idempotencia, v_diagnostico, v_tratamiento)
    VALUES (2, 2, 2, '2026-09-10 10:30:00', N'Revision pediatrica hijo', 'PROGRAMADA', NEWID(), NULL, NULL);
SET IDENTITY_INSERT dbo.citas OFF;
GO
