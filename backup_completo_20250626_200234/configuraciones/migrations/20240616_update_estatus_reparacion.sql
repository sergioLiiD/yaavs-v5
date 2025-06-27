-- Actualizar los estados de reparación
UPDATE estatus_reparacion SET orden = 1 WHERE nombre = 'RECIBIDO';
UPDATE estatus_reparacion SET orden = 2 WHERE nombre = 'EN DIAGNÓSTICO';
UPDATE estatus_reparacion SET orden = 3 WHERE nombre = 'PRESUPUESTO GENERADO';
UPDATE estatus_reparacion SET orden = 4 WHERE nombre = 'EN REPARACIÓN';
UPDATE estatus_reparacion SET orden = 5 WHERE nombre = 'REPARADO';
UPDATE estatus_reparacion SET orden = 6 WHERE nombre = 'ENTREGADO';
UPDATE estatus_reparacion SET orden = 7 WHERE nombre = 'CANCELADO'; 