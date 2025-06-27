-- Restaurar checklist items básicos
INSERT INTO checklist_items (nombre, descripcion, para_diagnostico, para_reparacion, created_at, updated_at) VALUES
('Batería', 'Verificar estado de la batería', true, true, NOW(), NOW()),
('Pantalla', 'Verificar funcionamiento de la pantalla', true, true, NOW(), NOW()),
('Cámara', 'Verificar funcionamiento de la cámara', true, true, NOW(), NOW()),
('Altavoces', 'Verificar funcionamiento de los altavoces', true, true, NOW(), NOW()),
('Micrófono', 'Verificar funcionamiento del micrófono', true, true, NOW(), NOW()),
('Botones', 'Verificar funcionamiento de los botones', true, true, NOW(), NOW()),
('Conexión', 'Verificar conexiones (USB, audio, etc.)', true, true, NOW(), NOW()),
('Software', 'Verificar estado del software', true, true, NOW(), NOW()),
('Carcasa', 'Verificar estado de la carcasa', true, true, NOW(), NOW()),
('Sensores', 'Verificar funcionamiento de los sensores', true, true, NOW(), NOW()); 