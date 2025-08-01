#!/bin/bash

echo "🔍 Debuggeando datos de proveedores..."

# Verificar la estructura de proveedores con sus datos bancarios
echo "📋 Proveedores con datos bancarios:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    id,
    nombre,
    contacto,
    telefono,
    rfc,
    banco,
    cuenta_bancaria,
    clabe_interbancaria,
    tipo
FROM proveedores
ORDER BY id
LIMIT 10;
"

echo ""
echo "📋 Verificando proveedores sin datos bancarios:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    id,
    nombre,
    contacto,
    CASE WHEN cuenta_bancaria IS NULL OR cuenta_bancaria = '' THEN 'SIN CUENTA' ELSE 'CON CUENTA' END as tiene_cuenta,
    CASE WHEN clabe_interbancaria IS NULL OR clabe_interbancaria = '' THEN 'SIN CLABE' ELSE 'CON CLABE' END as tiene_clabe
FROM proveedores
WHERE cuenta_bancaria IS NULL OR cuenta_bancaria = '' OR clabe_interbancaria IS NULL OR clabe_interbancaria = ''
ORDER BY id;
"

echo ""
echo "📋 Total de proveedores por tipo:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN cuenta_bancaria IS NOT NULL AND cuenta_bancaria != '' THEN 1 END) as con_cuenta,
    COUNT(CASE WHEN clabe_interbancaria IS NOT NULL AND clabe_interbancaria != '' THEN 1 END) as con_clabe
FROM proveedores
GROUP BY tipo;
"

echo "✅ Debug completado. Revisa los logs del navegador para ver la estructura de datos." 