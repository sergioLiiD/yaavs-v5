UPDATE "Reparacion"
SET "tecnicoId" = (
    SELECT "tecnicoAsignadoId"
    FROM "tickets"
    WHERE "id" = 3
),
"fotos" = ARRAY[]::text[],
"videos" = ARRAY[]::text[]
WHERE "ticketId" = 3; 