-- ECO-20260908-002 | Esquema de seguridad
-- Motor: SQL Server | Convencion: columnas con prefijo hungaro minusculo, tablas plural sin prefijo

CREATE TABLE dbo.usuarios (
    i_id                INT             IDENTITY(1,1) NOT NULL,
    v_nombre_usuario    VARCHAR(160)    NOT NULL,
    v_hash_contrasena   VARCHAR(255)    NOT NULL,
    b_activo            BIT             NOT NULL CONSTRAINT df_usuarios_activo DEFAULT 1,
    v_correo            VARCHAR(200)    NULL,
    v_nombre_completo   VARCHAR(200)    NULL,
    CONSTRAINT pk_usuarios PRIMARY KEY (i_id),
    CONSTRAINT uq_usuarios_nombre UNIQUE (v_nombre_usuario)
);

CREATE TABLE dbo.tokens_refresco (
    i_id                INT             IDENTITY(1,1) NOT NULL,
    i_id_usuario        INT             NOT NULL,
    v_token             VARCHAR(100)    NOT NULL,
    v_id_jwt            VARCHAR(100)    NOT NULL,
    d_fecha_creacion    DATETIME2(0)    NOT NULL,
    d_fecha_expiracion  DATETIME2(0)    NOT NULL,
    b_usado             BIT             NOT NULL,
    b_revocado          BIT             NOT NULL,
    d_fecha_revocacion  DATETIME2(0)    NULL,
    v_ip_creacion       VARCHAR(50)     NULL,
    v_agente_usuario    VARCHAR(500)    NULL,
    i_id_token_reemplazo INT            NULL,
    CONSTRAINT pk_tokens_refresco PRIMARY KEY (i_id),
    CONSTRAINT fk_tokens_usuario FOREIGN KEY (i_id_usuario) REFERENCES dbo.usuarios (i_id),
    CONSTRAINT uq_tokens_token UNIQUE (v_token)
);

CREATE TABLE dbo.intentos_login (
    i_id_usuario        INT             NOT NULL,
    i_intentos_fallidos INT             NOT NULL,
    d_fin_bloqueo       DATETIME2(0)    NULL,
    CONSTRAINT pk_intentos_login PRIMARY KEY (i_id_usuario),
    CONSTRAINT fk_intentos_usuario FOREIGN KEY (i_id_usuario) REFERENCES dbo.usuarios (i_id)
);

CREATE TABLE dbo.historial_contrasenas (
    i_id                INT             IDENTITY(1,1) NOT NULL,
    i_id_usuario        INT             NOT NULL,
    v_hash_contrasena   VARCHAR(255)    NOT NULL,
    d_fecha_creacion    DATETIME2(0)    NOT NULL,
    CONSTRAINT pk_historial_contrasenas PRIMARY KEY (i_id),
    CONSTRAINT fk_historial_usuario FOREIGN KEY (i_id_usuario) REFERENCES dbo.usuarios (i_id)
);

-- Usuario inicial: admin / Admin123!
INSERT INTO dbo.usuarios (v_nombre_usuario, v_hash_contrasena, b_activo, v_correo, v_nombre_completo)
VALUES ('admin', '$2a$11$dKIu0HI1D8CGA0Sh1sR5Du96GPOVrf6WZ0M3rPdqUD2Sy72WNhnJy', 1, 'admin@citasmedicas.local', 'Administrador del Sistema');
