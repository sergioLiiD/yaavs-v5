-- Actualizar los estados de reparación existentes
UPDATE "EstatusReparacion" 
SET nombre = 'En Recepción', 
    descripcion = 'El dispositivo ha sido recibido y está en proceso de recepción'
WHERE id = 1;

UPDATE "EstatusReparacion" 
SET nombre = 'En Diagnóstico', 
    descripcion = 'El dispositivo está siendo diagnosticado por el técnico'
WHERE id = 2;

UPDATE "EstatusReparacion" 
SET nombre = 'Diagnóstico Completado', 
    descripcion = 'El diagnóstico técnico ha sido completado'
WHERE id = 3;

UPDATE "EstatusReparacion" 
SET nombre = 'Esperando Aprobación de Presupuesto', 
    descripcion = 'Esperando la aprobación del presupuesto por parte del cliente'
WHERE id = 4;

UPDATE "EstatusReparacion" 
SET nombre = 'Presupuesto Aprobado', 
    descripcion = 'El presupuesto ha sido aprobado por el cliente'
WHERE id = 5;

UPDATE "EstatusReparacion" 
SET nombre = 'En Reparación', 
    descripcion = 'El dispositivo está en proceso de reparación'
WHERE id = 6;

UPDATE "EstatusReparacion" 
SET nombre = 'En Pruebas', 
    descripcion = 'El dispositivo está en fase de pruebas de funcionamiento'
WHERE id = 7;

UPDATE "EstatusReparacion" 
SET nombre = 'Entregado', 
    descripcion = 'El dispositivo ha sido entregado al cliente'
WHERE id = 8; 