-- Primero eliminar la reparación existente
DELETE FROM "Reparacion" WHERE "ticketId" = 3;

-- Luego crear una nueva reparación
INSERT INTO "Reparacion" (
    "ticketId",
    "tecnicoId",
    "fechaInicio",
    "fotos",
    "videos",
    "createdAt",
    "updatedAt"
)
SELECT 
    3,
    "tecnicoAsignadoId",
    NOW(),
    ARRAY[]::text[],
    ARRAY[]::text[],
    NOW(),
    NOW()
FROM "tickets"
WHERE id = 3; 