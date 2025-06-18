# Errores Comunes y Soluciones

Este documento recopila errores comunes encontrados durante el desarrollo y sus soluciones, para servir como referencia rápida.

## 1. Errores con Prisma y Relaciones

### 1.1 Error: "Unknown field for include statement on model"

**Problema:**
```typescript
// Error al intentar incluir una relación
reparacion: {
  include: {
    piezasReparacion: { // ❌ Error: Unknown field
      include: {
        pieza: true
      }
    }
  }
}
```

**Causa:**
- Prisma genera nombres específicos para las relaciones basados en el modelo
- El nombre que usamos en el código no coincide con el nombre generado por Prisma

**Solución:**
```typescript
// Usar el nombre correcto generado por Prisma
reparacion: {
  include: {
    piezas: { // ✅ Nombre correcto según el modelo
      include: {
        pieza: true
      }
    }
  }
}
```

**Prevención:**
- Revisar el modelo de Prisma para ver los nombres exactos de las relaciones
- Usar el autocompletado de TypeScript para ver los nombres disponibles
- Ver la documentación en `docs/ESTANDARIZACION.md` para las convenciones de nombres

### 1.2 Error: "Invalid value provided. Expected Boolean, provided String"

**Problema:**
```typescript
// Error al intentar guardar una respuesta de checklist
prisma.checklistRespuestaDiagnostico.create({
  data: {
    respuesta: "yes" // ❌ Error: Expected Boolean, provided String
  }
})
```

**Causa:**
- El modelo de Prisma espera un booleano para el campo `respuesta`
- El frontend está enviando un string ('yes'/'no')

**Solución:**
1. En el Frontend (al enviar):
```typescript
// Convertir booleano a string antes de enviar
checklist.map(item => ({
  respuesta: item.respuesta ? 'yes' : 'no'
}))
```

2. En el Backend (al recibir):
```typescript
// Convertir string a booleano antes de guardar
respuesta: String(item.respuesta).toLowerCase() === 'yes'
```

3. En el Frontend (al cargar):
```typescript
// Convertir respuesta a booleano al cargar
respuesta: respuestaExistente ? Boolean(respuestaExistente.respuesta) : false
```

**Prevención:**
- Mantener consistencia en el tipo de datos entre frontend y backend
- Documentar claramente el tipo esperado en cada lado
- Usar funciones de utilidad para las conversiones

## 2. Errores de Persistencia de Datos

### 2.1 Checklist no persiste después de recargar

**Problema:**
- Las respuestas del checklist se guardan pero desaparecen al recargar la página

**Causa:**
- El endpoint principal del ticket no incluye las respuestas del checklist en la consulta
- Las respuestas se guardan pero no se cargan al recargar

**Solución:**
1. Asegurar que el endpoint principal incluya las respuestas:
```typescript
reparacion: {
  include: {
    checklistDiagnostico: {
      include: {
        respuestas: {
          include: {
            checklistItem: true
          }
        }
      }
    }
  }
}
```

2. En el frontend, cargar las respuestas existentes:
```typescript
const respuestasExistentes = await checklistResponse.json();
if (respuestasExistentes && respuestasExistentes.length > 0) {
  const checklistConRespuestas = diagnosticItems.map((item) => {
    const respuestaExistente = respuestasExistentes.find(
      (r) => r.checklistItem.id === item.id
    );
    return {
      respuesta: respuestaExistente ? Boolean(respuestaExistente.respuesta) : false
    };
  });
}
```

**Prevención:**
- Siempre incluir las relaciones necesarias en las consultas principales
- Verificar que los datos se estén cargando correctamente en el frontend
- Usar el estado de React para mantener la consistencia de los datos

### 2.2 Reparación no concluye correctamente

**Problema:**
- Al marcar una reparación como completada, el ticket se marca como "Reparado" pero no se actualiza la fecha de finalización
- Esto causa que el ticket aparezca como "en reparación" en algunas vistas

**Causa:**
- Falta actualizar el campo `fecha_fin_reparacion` en el ticket cuando se completa la reparación
- Solo se está actualizando el estatus pero no la fecha de finalización

**Solución:**
```typescript
// En el endpoint de actualización de reparación
if (completar) {
  // Actualizar estatus
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      estatusReparacionId: estatusReparado.id,
      fechaFinReparacion: new Date() // Agregar esta línea
    }
  });
}
```

**Prevención:**
- Siempre actualizar todos los campos relacionados al cambiar el estado de un ticket
- Mantener un registro de las fechas de inicio y fin de cada etapa
- Verificar que todos los campos necesarios se actualicen al completar una etapa

### 2.3 Checklist de Reparación no persiste

**Problema:**
- Las respuestas del checklist de reparación se guardan pero desaparecen al recargar la página
- Similar al problema del checklist de diagnóstico

**Causa:**
- El endpoint principal del ticket no incluye las respuestas del checklist de reparación
- Las respuestas se guardan pero no se cargan al recargar
- Posible inconsistencia en los tipos de datos (boolean vs string)

**Solución:**
1. Asegurar que el endpoint principal incluya las respuestas:
```typescript
reparacion: {
  include: {
    checklistReparacion: {
      include: {
        respuestas: {
          include: {
            checklistItem: true
          }
        }
      }
    }
  }
}
```

2. En el frontend, convertir correctamente los tipos:
```typescript
// Al cargar
respuesta: respuestaExistente ? Boolean(respuestaExistente.respuesta) : false

// Al guardar
checklist.map(item => ({
  itemId: item.itemId,
  respuesta: item.respuesta ? 'yes' : 'no',
  observacion: item.observacion
}))
```

3. En el backend, convertir el string a booleano:
```typescript
respuesta: String(item.respuesta).toLowerCase() === 'yes'
```

**Prevención:**
- Mantener consistencia en el manejo de tipos entre frontend y backend
- Incluir todas las relaciones necesarias en las consultas principales
- Usar funciones de utilidad para las conversiones de tipos
- Seguir el mismo patrón implementado en el checklist de diagnóstico

### 2.4 Pérdida de datos al guardar checklists

**Problema:**
- Al guardar un checklist (diagnóstico o reparación), se pierden otros datos como el diagnóstico o las observaciones
- Esto ocurre porque el `upsert` está sobrescribiendo todos los campos

**Causa:**
- El `upsert` en la reparación está actualizando todos los campos, incluso cuando solo queremos actualizar el checklist
- No se están preservando los datos existentes al actualizar

**Solución:**
```typescript
// En el endpoint de checklist
const reparacion = await prisma.reparacion.upsert({
  where: { ticketId },
  update: {}, // No actualizar nada aquí para preservar los datos
  create: {
    ticketId,
    fechaInicio: new Date()
  }
});
```

**Prevención:**
- Usar `update: {}` en los `upsert` cuando solo queremos preservar datos
- Separar las actualizaciones de datos en endpoints diferentes
- Verificar que los datos se preserven después de cada operación
- Implementar pruebas para verificar la integridad de los datos

## 3. Mejores Prácticas

1. **Tipos de Datos:**
   - Mantener consistencia entre frontend y backend
   - Documentar claramente los tipos esperados
   - Usar TypeScript para validación de tipos

2. **Relaciones en Prisma:**
   - Revisar el modelo de Prisma para nombres correctos
   - Usar el autocompletado de TypeScript
   - Seguir las convenciones de nombres documentadas

3. **Persistencia de Datos:**
   - Incluir todas las relaciones necesarias en las consultas
   - Verificar la carga y guardado de datos
   - Implementar manejo de errores robusto

4. **Documentación:**
   - Mantener este documento actualizado
   - Documentar soluciones a problemas comunes
   - Incluir ejemplos de código cuando sea posible 