-- Migración: SP Listado Citas Paginado
-- Identificador: ECO-20260908-008
-- Fecha: 2026-09-08

CREATE OR ALTER PROCEDURE USP_SEL_LISTADO_CITAS
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @IdPaciente INT = NULL,
    @IdMedico INT = NULL,
    @TotalRegistros INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT @TotalRegistros = COUNT(*)
    FROM citas c
    WHERE (@IdPaciente IS NULL OR c.i_id_paciente = @IdPaciente)
      AND (@IdMedico IS NULL OR c.i_id_medico = @IdMedico);

    SELECT 
        c.i_id, 
        c.i_id_paciente, 
        p.v_nombres + ' ' + p.v_apellidos AS v_nombre_paciente,
        c.i_id_medico, 
        m.v_nombres + ' ' + m.v_apellidos AS v_nombre_medico,
        c.d_fecha_hora, 
        c.v_motivo, 
        c.v_estado
    FROM citas c
    JOIN pacientes p ON p.i_id = c.i_id_paciente
    JOIN medicos m ON m.i_id = c.i_id_medico
    WHERE (@IdPaciente IS NULL OR c.i_id_paciente = @IdPaciente)
      AND (@IdMedico IS NULL OR c.i_id_medico = @IdMedico)
    ORDER BY c.d_fecha_hora DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;

END
GO
