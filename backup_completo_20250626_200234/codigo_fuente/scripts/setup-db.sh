#!/bin/bash

# Generar el cliente de Prisma
npx prisma generate

# Ejecutar las migraciones
npx prisma migrate deploy

# Ejecutar el seed
npx prisma db seed 