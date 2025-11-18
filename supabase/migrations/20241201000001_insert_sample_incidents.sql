-- Insert sample incidents
INSERT INTO incidents (type, location, latitude, longitude, impact, description, reported_by, reported_by_email, created_at) VALUES
('choque', 'Av. Ambalá - Universidad de Ibagué', 4.449202, -75.200074, 'alto', 'Choque entre dos vehículos, tránsito lento', 'Carlos M.', 'carlos.m@email.com', NOW() - INTERVAL '15 minutes'),
('obra', 'Carrera 5 - Centro Comercial Aqua', 4.440518, -75.204285, 'medio', 'Trabajos de mantenimiento vial', 'Maria S.', 'maria.s@email.com', NOW() - INTERVAL '45 minutes'),
('congestion', 'Terminal de Transportes', 4.437023, -75.234738, 'alto', 'Congestión por hora pico', 'Sofia T.', 'sofia.t@email.com', NOW() - INTERVAL '5 minutes'),
('cierre', 'Av. 19 - Centro Comercial La Quinta', 4.439624, -75.223067, 'medio', 'Cierre parcial por evento', 'Luis R.', 'luis.r@email.com', NOW() - INTERVAL '30 minutes');