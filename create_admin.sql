-- Crear el usuario administrador
INSERT INTO usuarios (email, nombre, "apellidoPaterno", "apellidoMaterno", "passwordHash", activo, "createdAt", "updatedAt")npm
VALUES (
  'sergio@hoom.mx',
  'Sergio',
  'Velazco',
  NULL,
  '$2b$10$LEQIkAkZSzVTeAdZb.sjAuLlcCWatonqvJKTGCS/q7XY.KVma7x46',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Obtener el ID del usuario recién creado
DO $$
DECLARE
  v_usuario_id INT;
  v_rol_id INT;
BEGIN
  -- Obtener el ID del usuario
  SELECT id INTO v_usuario_id FROM usuarios WHERE email = 'sergio@hoom.mx';
  
  -- Obtener el ID del rol ADMINISTRADOR
  SELECT id INTO v_rol_id FROM roles WHERE nombre = 'ADMINISTRADOR';
  
  -- Asignar el rol al usuario
  INSERT INTO usuarios_roles ("usuarioId", "rolId", "createdAt", "updatedAt")
  VALUES (v_usuario_id, v_rol_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
END $$; 