USE hospital_queue;
GO

-- localizar y eliminar la UNIQUE constraint existente en patients
DECLARE @uq sysname;
SELECT @uq = kc.name
FROM sys.key_constraints kc
JOIN sys.tables t ON t.object_id = kc.parent_object_id
WHERE kc.[type] = 'UQ' AND t.[name] = 'patients';

IF @uq IS NOT NULL
BEGIN
  EXEC('ALTER TABLE dbo.patients DROP CONSTRAINT ' + QUOTENAME(@uq));
END
GO

-- índice único filtrado: permite muchos NULL, exige unicidad solo si hay valor
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes 
  WHERE name = 'UX_patients_code_notnull' AND object_id = OBJECT_ID('dbo.patients')
)
BEGIN
  CREATE UNIQUE INDEX UX_patients_code_notnull
  ON dbo.patients(code)
  WHERE code IS NOT NULL;
END
GO
