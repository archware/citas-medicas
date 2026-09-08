-- Migración: SP Listado Pacientes Paginado
-- Identificador: ECO-20260908-004
-- Fecha: 2026-09-08

CREATE OR ALTER PROCEDURE USP_SEL_LISTADO_PACIENTES
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @Filtro NVARCHAR(100) = NULL,
    @TotalRegistros INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Calcular el total de registros
    SELECT @TotalRegistros = COUNT(*)
    FROM pacientes
    WHERE (@Filtro IS NULL OR v_nombres LIKE '%' + @Filtro + '%' OR v_apellidos LIKE '%' + @Filtro + '%' OR v_numero_documento LIKE '%' + @Filtro + '%');

    -- Obtener la página solicitada
    SELECT 
        i_id, 
        v_nombres, 
        v_apellidos, 
        v_numero_documento, 
        v_telefono, 
        v_correo, 
        d_fecha_nacimiento
    FROM pacientes
    WHERE (@Filtro IS NULL OR v_nombres LIKE '%' + @Filtro + '%' OR v_apellidos LIKE '%' + @Filtro + '%' OR v_numero_documento LIKE '%' + @Filtro + '%')
    ORDER BY i_id DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;

END
GO
