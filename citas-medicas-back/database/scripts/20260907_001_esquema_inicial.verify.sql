-- Verificador de 20260907_001: afirma solo lo que su propia migracion construyo (Ley B §5.4.1)

-- Tablas creadas por esta migracion
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'pacientes' AND schema_id = SCHEMA_ID('dbo'))
    RAISERROR('Tabla dbo.pacientes no existe', 16, 1);

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'medicos' AND schema_id = SCHEMA_ID('dbo'))
    RAISERROR('Tabla dbo.medicos no existe', 16, 1);

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'citas' AND schema_id = SCHEMA_ID('dbo'))
    RAISERROR('Tabla dbo.citas no existe', 16, 1);

-- Columna de idempotencia en citas
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.citas') AND name = 'v_id_idempotencia')
    RAISERROR('Columna citas.v_id_idempotencia no existe', 16, 1);

-- Restriccion de estados validos
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'ck_citas_estado')
    RAISERROR('Restriccion ck_citas_estado no existe', 16, 1);
