SELECT r.*, t."tecnicoAsignadoId"
FROM "Reparacion" r
JOIN "tickets" t ON r."ticketId" = t.id
WHERE t.id = 3; 