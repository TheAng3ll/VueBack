BEGIN;

-- =========================================
-- Seed base para Chefsito
-- Requiere tablas:
-- usuarios, ingredientes, recetas, receta_ingredientes, fotos
-- y tipo ENUM: tipo_entidad ('RECETA', 'INGREDIENTE', 'USUARIO')
-- =========================================

-- Limpieza opcional para entorno de desarrollo
TRUNCATE TABLE receta_ingredientes, fotos, recetas, ingredientes, usuarios RESTART IDENTITY CASCADE;

-- =========================================
-- 1) USUARIOS
-- =========================================
INSERT INTO usuarios (username, email, password_hash, biografia)
VALUES
  ('chef_ana', 'ana@chefsito.dev', 'hash_demo_ana', 'Fan de recetas rapidas y saludables.'),
  ('chef_luis', 'luis@chefsito.dev', 'hash_demo_luis', 'Especialista en cocina casera mexicana.'),
  ('chef_maria', 'maria@chefsito.dev', 'hash_demo_maria', 'Postres faciles y cocina para principiantes.'),
  ('chef_carlos', 'carlos@chefsito.dev', 'hash_demo_carlos', 'Amante de la proteina y meal prep.'),
  ('chef_sofia', 'sofia@chefsito.dev', 'hash_demo_sofia', 'Recetas vegetarianas y bowls creativos.'),
  ('chef_diego', 'diego@chefsito.dev', 'hash_demo_diego', 'Cocina italiana en casa.'),
  ('chef_vale', 'vale@chefsito.dev', 'hash_demo_vale', 'Snacks y desayunos express.'),
  ('chef_ivan', 'ivan@chefsito.dev', 'hash_demo_ivan', 'Cocina internacional y fusion.')
ON CONFLICT (email) DO NOTHING;

-- =========================================
-- 2) INGREDIENTES
-- =========================================
INSERT INTO ingredientes (nombre, descripcion, categoria)
VALUES
  ('huevo', 'Huevo de gallina', 'proteina'),
  ('tomate', 'Tomate rojo fresco', 'verdura'),
  ('cebolla', 'Cebolla blanca', 'verdura'),
  ('ajo', 'Diente de ajo', 'condimento'),
  ('queso', 'Queso rallado', 'lacteo'),
  ('leche', 'Leche entera', 'lacteo'),
  ('mantequilla', 'Mantequilla sin sal', 'lacteo'),
  ('harina', 'Harina de trigo', 'cereal'),
  ('arroz', 'Arroz blanco', 'cereal'),
  ('pasta', 'Pasta seca', 'cereal'),
  ('pechuga de pollo', 'Pechuga limpia', 'proteina'),
  ('carne molida', 'Carne de res molida', 'proteina'),
  ('atun', 'Atun en lata', 'proteina'),
  ('zanahoria', 'Zanahoria fresca', 'verdura'),
  ('pimiento', 'Pimiento morron', 'verdura'),
  ('espinaca', 'Hojas de espinaca', 'verdura'),
  ('papa', 'Papa blanca', 'verdura'),
  ('aceite de oliva', 'Aceite extra virgen', 'grasa'),
  ('sal', 'Sal fina', 'condimento'),
  ('pimienta', 'Pimienta negra molida', 'condimento'),
  ('oregano', 'Oregano seco', 'condimento'),
  ('albahaca', 'Hojas de albahaca', 'condimento'),
  ('limon', 'Limon amarillo', 'fruta'),
  ('tortilla de maiz', 'Tortilla mediana', 'cereal'),
  ('pan', 'Pan de caja', 'cereal'),
  ('yogur natural', 'Yogur sin azucar', 'lacteo'),
  ('platano', 'Platano maduro', 'fruta'),
  ('fresas', 'Fresas frescas', 'fruta'),
  ('avena', 'Avena en hojuelas', 'cereal'),
  ('frijol cocido', 'Frijol negro cocido', 'legumbre')
ON CONFLICT (nombre) DO NOTHING;

-- =========================================
-- 3) RECETAS
-- =========================================
INSERT INTO recetas (titulo, instrucciones, comensales, dificultad, autor_id)
VALUES
  (
    'Omelette de queso y tomate',
    'Batir huevos con sal y pimienta. Cocinar en sarten con mantequilla. Agregar tomate, cebolla y queso. Doblar y servir.',
    1,
    'Fácil',
    (SELECT id FROM usuarios WHERE username = 'chef_ana')
  ),
  (
    'Arroz con pollo express',
    'Sellar pollo en cubos. Sofreir cebolla, ajo y pimiento. Agregar arroz, agua y condimentos. Cocinar hasta secar.',
    3,
    'Media',
    (SELECT id FROM usuarios WHERE username = 'chef_luis')
  ),
  (
    'Pasta cremosa de espinaca',
    'Cocer pasta. Saltear ajo y espinaca, agregar leche y queso para formar salsa. Integrar pasta y sazonar.',
    2,
    'Fácil',
    (SELECT id FROM usuarios WHERE username = 'chef_diego')
  ),
  (
    'Tacos de carne molida',
    'Sofreir cebolla y ajo, agregar carne molida con tomate. Sazonar y servir en tortillas calientes.',
    4,
    'Fácil',
    (SELECT id FROM usuarios WHERE username = 'chef_luis')
  ),
  (
    'Ensalada tibia de atun',
    'Mezclar atun con espinaca, tomate y zanahoria cocida. Aderezar con limon, aceite de oliva, sal y pimienta.',
    2,
    'Fácil',
    (SELECT id FROM usuarios WHERE username = 'chef_sofia')
  ),
  (
    'Papas al horno con oregano',
    'Cortar papas en gajos, mezclar con aceite, sal, pimienta y oregano. Hornear hasta dorar.',
    3,
    'Fácil',
    (SELECT id FROM usuarios WHERE username = 'chef_carlos')
  ),
  (
    'Sopa de verduras casera',
    'Hervir zanahoria, papa, cebolla y pimiento en agua con sal. Terminar con aceite de oliva y pimienta.',
    4,
    'Fácil',
    (SELECT id FROM usuarios WHERE username = 'chef_vale')
  ),
  (
    'Sandwich proteico de pollo',
    'Cocer pechuga y desmenuzar. Mezclar con yogur, limon y pimienta. Servir en pan con tomate y espinaca.',
    2,
    'Media',
    (SELECT id FROM usuarios WHERE username = 'chef_carlos')
  ),
  (
    'Hotcakes de avena y platano',
    'Licuar avena, platano, huevo y leche. Cocinar porciones en sarten antiadherente hasta dorar ambos lados.',
    2,
    'Fácil',
    (SELECT id FROM usuarios WHERE username = 'chef_maria')
  ),
  (
    'Bowl de arroz con frijol',
    'Servir arroz cocido con frijol, tomate, cebolla y limon. Terminar con aceite de oliva y oregano.',
    2,
    'Fácil',
    (SELECT id FROM usuarios WHERE username = 'chef_sofia')
  ),
  (
    'Huevos revueltos con espinaca',
    'Saltear cebolla y espinaca. Agregar huevo batido, sal y pimienta. Cocinar a fuego bajo.',
    1,
    'Fácil',
    (SELECT id FROM usuarios WHERE username = 'chef_ana')
  ),
  (
    'Licuado de fresa y yogur',
    'Licuar yogur, fresas, platano y un toque de leche hasta obtener textura cremosa.',
    2,
    'Fácil',
    (SELECT id FROM usuarios WHERE username = 'chef_vale')
  );

-- =========================================
-- 4) RECETA_INGREDIENTES
-- =========================================
INSERT INTO receta_ingredientes (receta_id, ingrediente_id, cantidad, unidad_medida)
SELECT r.id, i.id, x.cantidad, x.unidad
FROM (
  VALUES
  ('Omelette de queso y tomate', 'huevo', 2.00, 'piezas'),
  ('Omelette de queso y tomate', 'tomate', 0.50, 'piezas'),
  ('Omelette de queso y tomate', 'cebolla', 0.25, 'piezas'),
  ('Omelette de queso y tomate', 'queso', 40.00, 'gramos'),
  ('Omelette de queso y tomate', 'mantequilla', 10.00, 'gramos'),
  ('Omelette de queso y tomate', 'sal', 1.00, 'cdita'),
  ('Omelette de queso y tomate', 'pimienta', 0.50, 'cdita'),

  ('Arroz con pollo express', 'pechuga de pollo', 350.00, 'gramos'),
  ('Arroz con pollo express', 'arroz', 1.00, 'taza'),
  ('Arroz con pollo express', 'cebolla', 0.50, 'piezas'),
  ('Arroz con pollo express', 'ajo', 2.00, 'dientes'),
  ('Arroz con pollo express', 'pimiento', 0.50, 'piezas'),
  ('Arroz con pollo express', 'aceite de oliva', 1.00, 'cda'),
  ('Arroz con pollo express', 'sal', 1.00, 'cdita'),

  ('Pasta cremosa de espinaca', 'pasta', 250.00, 'gramos'),
  ('Pasta cremosa de espinaca', 'espinaca', 120.00, 'gramos'),
  ('Pasta cremosa de espinaca', 'ajo', 2.00, 'dientes'),
  ('Pasta cremosa de espinaca', 'leche', 0.75, 'taza'),
  ('Pasta cremosa de espinaca', 'queso', 80.00, 'gramos'),
  ('Pasta cremosa de espinaca', 'sal', 1.00, 'cdita'),

  ('Tacos de carne molida', 'carne molida', 400.00, 'gramos'),
  ('Tacos de carne molida', 'tortilla de maiz', 8.00, 'piezas'),
  ('Tacos de carne molida', 'cebolla', 0.50, 'piezas'),
  ('Tacos de carne molida', 'ajo', 2.00, 'dientes'),
  ('Tacos de carne molida', 'tomate', 1.00, 'piezas'),
  ('Tacos de carne molida', 'sal', 1.00, 'cdita'),

  ('Ensalada tibia de atun', 'atun', 1.00, 'lata'),
  ('Ensalada tibia de atun', 'espinaca', 80.00, 'gramos'),
  ('Ensalada tibia de atun', 'tomate', 1.00, 'piezas'),
  ('Ensalada tibia de atun', 'zanahoria', 1.00, 'piezas'),
  ('Ensalada tibia de atun', 'limon', 0.50, 'piezas'),
  ('Ensalada tibia de atun', 'aceite de oliva', 1.00, 'cda'),

  ('Papas al horno con oregano', 'papa', 4.00, 'piezas'),
  ('Papas al horno con oregano', 'aceite de oliva', 1.00, 'cda'),
  ('Papas al horno con oregano', 'oregano', 1.00, 'cdita'),
  ('Papas al horno con oregano', 'sal', 1.00, 'cdita'),
  ('Papas al horno con oregano', 'pimienta', 0.50, 'cdita'),

  ('Sopa de verduras casera', 'zanahoria', 2.00, 'piezas'),
  ('Sopa de verduras casera', 'papa', 2.00, 'piezas'),
  ('Sopa de verduras casera', 'cebolla', 0.50, 'piezas'),
  ('Sopa de verduras casera', 'pimiento', 0.50, 'piezas'),
  ('Sopa de verduras casera', 'sal', 1.00, 'cdita'),

  ('Sandwich proteico de pollo', 'pechuga de pollo', 250.00, 'gramos'),
  ('Sandwich proteico de pollo', 'pan', 4.00, 'rebanadas'),
  ('Sandwich proteico de pollo', 'yogur natural', 3.00, 'cdas'),
  ('Sandwich proteico de pollo', 'limon', 0.50, 'piezas'),
  ('Sandwich proteico de pollo', 'tomate', 1.00, 'piezas'),
  ('Sandwich proteico de pollo', 'espinaca', 40.00, 'gramos'),

  ('Hotcakes de avena y platano', 'avena', 1.00, 'taza'),
  ('Hotcakes de avena y platano', 'platano', 1.00, 'piezas'),
  ('Hotcakes de avena y platano', 'huevo', 1.00, 'piezas'),
  ('Hotcakes de avena y platano', 'leche', 0.50, 'taza'),
  ('Hotcakes de avena y platano', 'mantequilla', 5.00, 'gramos'),

  ('Bowl de arroz con frijol', 'arroz', 1.00, 'taza'),
  ('Bowl de arroz con frijol', 'frijol cocido', 1.00, 'taza'),
  ('Bowl de arroz con frijol', 'tomate', 1.00, 'piezas'),
  ('Bowl de arroz con frijol', 'cebolla', 0.25, 'piezas'),
  ('Bowl de arroz con frijol', 'limon', 0.50, 'piezas'),
  ('Bowl de arroz con frijol', 'oregano', 0.50, 'cdita'),

  ('Huevos revueltos con espinaca', 'huevo', 2.00, 'piezas'),
  ('Huevos revueltos con espinaca', 'espinaca', 60.00, 'gramos'),
  ('Huevos revueltos con espinaca', 'cebolla', 0.25, 'piezas'),
  ('Huevos revueltos con espinaca', 'sal', 0.75, 'cdita'),
  ('Huevos revueltos con espinaca', 'pimienta', 0.25, 'cdita'),

  ('Licuado de fresa y yogur', 'fresas', 120.00, 'gramos'),
  ('Licuado de fresa y yogur', 'platano', 1.00, 'piezas'),
  ('Licuado de fresa y yogur', 'yogur natural', 1.00, 'taza'),
  ('Licuado de fresa y yogur', 'leche', 0.50, 'taza')
) AS x(receta_titulo, ingrediente_nombre, cantidad, unidad)
JOIN recetas r ON r.titulo = x.receta_titulo
JOIN ingredientes i ON i.nombre = x.ingrediente_nombre;

-- =========================================
-- 5) FOTOS (usuarios y recetas)
-- =========================================
INSERT INTO fotos (url, entidad_id, entidad_tipo, es_principal)
VALUES
  ('https://images.unsplash.com/photo-1494790108377-be9c29b29330', (SELECT id FROM usuarios WHERE username = 'chef_ana'), 'USUARIO', TRUE),
  ('https://images.unsplash.com/photo-1500648767791-00dcc994a43e', (SELECT id FROM usuarios WHERE username = 'chef_luis'), 'USUARIO', TRUE),
  ('https://images.unsplash.com/photo-1438761681033-6461ffad8d80', (SELECT id FROM usuarios WHERE username = 'chef_maria'), 'USUARIO', TRUE),
  ('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', (SELECT id FROM usuarios WHERE username = 'chef_carlos'), 'USUARIO', TRUE),

  ('https://images.unsplash.com/photo-1510693206972-df098062cb71', (SELECT id FROM recetas WHERE titulo = 'Omelette de queso y tomate'), 'RECETA', TRUE),
  ('https://images.unsplash.com/photo-1603133872878-684f208fb84b', (SELECT id FROM recetas WHERE titulo = 'Arroz con pollo express'), 'RECETA', TRUE),
  ('https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', (SELECT id FROM recetas WHERE titulo = 'Pasta cremosa de espinaca'), 'RECETA', TRUE),
  ('https://images.unsplash.com/photo-1613514785940-daed07799d9b', (SELECT id FROM recetas WHERE titulo = 'Tacos de carne molida'), 'RECETA', TRUE),
  ('https://images.unsplash.com/photo-1547592166-23ac45744acd', (SELECT id FROM recetas WHERE titulo = 'Ensalada tibia de atun'), 'RECETA', TRUE),
  ('https://images.unsplash.com/photo-1562967914-608f82629710', (SELECT id FROM recetas WHERE titulo = 'Hotcakes de avena y platano'), 'RECETA', TRUE);

COMMIT;
