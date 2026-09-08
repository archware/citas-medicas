-- Migración: SP Listado Medicos Paginado
-- Identificador: ECO-20260908-006
-- Fecha: 2026-09-08

CREATE OR ALTER PROCEDURE USP_SEL_LISTADO_MEDICOS
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @Filtro NVARCHAR(100) = NULL,
    @TotalRegistros INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT @TotalRegistros = COUNT(*)
    FROM medicos
    WHERE (@Filtro IS NULL OR v_nombres LIKE '%' + @Filtro + '%' OR v_apellidos LIKE '%' + @Filtro + '%' OR v_especialidad LIKE '%' + @Filtro + '%');

    SELECT 
        i_id, 
        v_nombres, 
        v_apellidos, 
        v_numero_colegiatura, 
        v_especialidad,
        v_telefono, 
        v_correo,
        b_activo
    FROM medicos
    WHERE (@Filtro IS NULL OR v_nombres LIKE '%' + @Filtro + '%' OR v_apellidos LIKE '%' + @Filtro + '%' OR v_especialidad LIKE '%' + @Filtro + '%')
    ORDER BY i_id DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;

END
GO
