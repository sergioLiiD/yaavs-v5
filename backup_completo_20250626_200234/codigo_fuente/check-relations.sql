-- Verificar el ticket y sus relaciones básicas
SELECT 
    t.*,
    c.nombre as cliente_nombre,
    ts.nombre as tipo_servicio,
    m.nombre as modelo_nombre,
    er.nombre as estatus,
    u.nombre as tecnico_nombre
FROM "tickets" t
LEFT JOIN "Cliente" c ON t."clienteId" = c.id
LEFT JOIN "tipos_servicio" ts ON t."tipoServicioId" = ts.id
LEFT JOIN "modelos" m ON t."modeloId" = m.id
LEFT JOIN "EstatusReparacion" er ON t."estatusReparacionId" = er.id
LEFT JOIN "Usuario" u ON t."tecnicoAsignadoId" = u.id
WHERE t.id = 3;

-- Verificar la reparación y su técnico
SELECT 
    r.*,
    u.nombre as tecnico_nombre
FROM "Reparacion" r
LEFT JOIN "Usuario" u ON r."tecnicoId" = u.id
WHERE r."ticketId" = 3; 