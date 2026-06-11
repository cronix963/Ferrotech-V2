-- FERROTECH — PostgreSQL Database Schema
-- Run: psql -U postgres -d ferrotech_db -f database/schema-postgres.sql

CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, password_hash VARCHAR(255), nombre VARCHAR(255) NOT NULL, rol VARCHAR(50) NOT NULL DEFAULT 'cliente', avatar VARCHAR(500), google_id VARCHAR(255), provider VARCHAR(50) NOT NULL DEFAULT 'credentials', telefono VARCHAR(50), activo BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS categorias (id SERIAL PRIMARY KEY, nombre VARCHAR(255) NOT NULL, descripcion VARCHAR(500), icono VARCHAR(10) DEFAULT '📦', activo BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS proveedores (id SERIAL PRIMARY KEY, nombre VARCHAR(255) NOT NULL, contacto VARCHAR(255), email VARCHAR(255), telefono VARCHAR(50), direccion VARCHAR(500), ciudad VARCHAR(100), notas TEXT, activo BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS productos (id SERIAL PRIMARY KEY, nombre VARCHAR(255) NOT NULL, descripcion TEXT, categoria_id INTEGER, categoria VARCHAR(100), precio NUMERIC(10,2) NOT NULL DEFAULT 0, precio_compra NUMERIC(10,2) DEFAULT 0, stock INTEGER NOT NULL DEFAULT 0, stock_minimo INTEGER NOT NULL DEFAULT 5, unidad VARCHAR(50) NOT NULL DEFAULT 'unidad', codigo_barras VARCHAR(100), codigo_interno VARCHAR(100), proveedor_id INTEGER, icono VARCHAR(10) DEFAULT '📦', imagen VARCHAR(500), activo BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW(), FOREIGN KEY (categoria_id) REFERENCES categorias(id), FOREIGN KEY (proveedor_id) REFERENCES proveedores(id));
CREATE TABLE IF NOT EXISTS clientes (id SERIAL PRIMARY KEY, user_id INTEGER, nombre VARCHAR(255) NOT NULL, email VARCHAR(255), telefono VARCHAR(50), direccion VARCHAR(500), ciudad VARCHAR(100), nit VARCHAR(50), empresa VARCHAR(255), total_compras INTEGER NOT NULL DEFAULT 0, total_gastado NUMERIC(12,2) NOT NULL DEFAULT 0, ultima_compra TIMESTAMP, notas TEXT, activo BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW(), FOREIGN KEY (user_id) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS pedidos (id SERIAL PRIMARY KEY, codigo VARCHAR(50) NOT NULL UNIQUE, cliente_id INTEGER, cliente VARCHAR(255) NOT NULL, email VARCHAR(255), telefono VARCHAR(50), direccion VARCHAR(500), items JSONB, subtotal NUMERIC(12,2) NOT NULL DEFAULT 0, impuesto NUMERIC(12,2) NOT NULL DEFAULT 0, total NUMERIC(12,2) NOT NULL DEFAULT 0, tipo VARCHAR(50) NOT NULL DEFAULT 'tienda', estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', pago VARCHAR(50) NOT NULL DEFAULT 'Pendiente', metodo_pago VARCHAR(50), notas TEXT, creado_por INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW(), FOREIGN KEY (cliente_id) REFERENCES clientes(id), FOREIGN KEY (creado_por) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS ventas (id SERIAL PRIMARY KEY, pedido_id INTEGER, vendedor_id INTEGER, cliente_id INTEGER, total NUMERIC(12,2) NOT NULL DEFAULT 0, metodo_pago VARCHAR(50), estado VARCHAR(50) NOT NULL DEFAULT 'Completada', notas TEXT, created_at TIMESTAMP NOT NULL DEFAULT NOW(), FOREIGN KEY (pedido_id) REFERENCES pedidos(id), FOREIGN KEY (vendedor_id) REFERENCES users(id), FOREIGN KEY (cliente_id) REFERENCES clientes(id));
CREATE TABLE IF NOT EXISTS compras (id SERIAL PRIMARY KEY, codigo VARCHAR(50) NOT NULL UNIQUE, proveedor_id INTEGER, proveedor VARCHAR(255) NOT NULL, items JSONB, total NUMERIC(12,2) NOT NULL DEFAULT 0, estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', notas TEXT, creado_por INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW(), FOREIGN KEY (proveedor_id) REFERENCES proveedores(id), FOREIGN KEY (creado_por) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS envios (id SERIAL PRIMARY KEY, pedido_id INTEGER, direccion VARCHAR(500) NOT NULL, ciudad VARCHAR(100), transportista VARCHAR(255), tracking_numero VARCHAR(100), estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', fecha_salida TIMESTAMP, fecha_entrega TIMESTAMP, notas TEXT, created_at TIMESTAMP NOT NULL DEFAULT NOW(), FOREIGN KEY (pedido_id) REFERENCES pedidos(id));
CREATE TABLE IF NOT EXISTS cotizaciones (id SERIAL PRIMARY KEY, codigo VARCHAR(50) NOT NULL UNIQUE, cliente_id INTEGER, cliente VARCHAR(255) NOT NULL, items JSONB, subtotal NUMERIC(12,2) NOT NULL DEFAULT 0, impuesto NUMERIC(12,2) NOT NULL DEFAULT 0, total NUMERIC(12,2) NOT NULL DEFAULT 0, estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', validez_dias INTEGER NOT NULL DEFAULT 30, notas TEXT, creado_por INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW(), FOREIGN KEY (cliente_id) REFERENCES clientes(id), FOREIGN KEY (creado_por) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS pagos_cobros (id SERIAL PRIMARY KEY, tipo VARCHAR(50) NOT NULL, referencia_id INTEGER, referencia_tipo VARCHAR(50), monto NUMERIC(12,2) NOT NULL DEFAULT 0, metodo VARCHAR(50) NOT NULL, concepto VARCHAR(500), cliente VARCHAR(255), estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', registrado_por INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW(), FOREIGN KEY (registrado_por) REFERENCES users(id));

INSERT INTO categorias (nombre, descripcion, icono) VALUES ('Materiales de Construcción', 'Cemento, varillas, ladrillos y materiales para obra', '🏗️'), ('Ferretería General', 'Clavos, herramientas manuales y accesorios', '🔧'), ('Electricidad', 'Cables, interruptores y material eléctrico', '⚡'), ('Plomería', 'Tuberías PVC, conexiones y accesorios sanitarios', '🚿'), ('Pinturas', 'Látex, impermeabilizantes y acabados', '🎨'), ('Herramientas', 'Herramientas manuales y eléctricas profesionales', '🔨'), ('Seguridad', 'Equipos de protección personal y seguridad', '🦺'), ('Jardín', 'Riego, herramientas de jardín y exterior', '🌿') ON CONFLICT DO NOTHING;

INSERT INTO users (email, password_hash, nombre, rol, provider, activo) VALUES ('admin@ferrotech.bo', '$2b$10$dE7kHORurC50Yjfh0NEoFuAH9fKvfn0.8GS/fQoyWxjob2oe.nGUW', 'Administrador', 'admin', 'credentials', TRUE) ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password_hash, nombre, rol, provider, activo) VALUES ('vendedor@ferrotech.bo', '$2b$10$pA3pJJi0Rdq/Fz0Rlx.H7.7x9NImO8wDBtmEM8r25u8FkDrwaISaG', 'Carlos Vendedor', 'vendedor', 'credentials', TRUE) ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, nombre, rol, provider, activo) VALUES ('cronix963@gmail.com', 'Miguel Fernandez', 'admin', 'google', TRUE) ON CONFLICT (email) DO NOTHING;

INSERT INTO clientes (nombre, email, telefono, direccion, ciudad, nit, empresa) VALUES ('Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456', 'Santa Cruz', '12345678', 'Los Andes S.A.'), ('Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789', 'Santa Cruz', '87654321', 'Ing. SC Ltda.'), ('Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123', 'Santa Cruz', '11223344', 'Dis. Norte S.R.L.');

INSERT INTO proveedores (nombre, contacto, email, telefono, direccion, ciudad) VALUES ('Cemento F', 'Juan Pérez', 'ventas@cementof.bo', '7221111', 'Zona Industrial', 'La Paz'), ('Herramientas Pro', 'María García', 'info@herramientaspro.bo', '7222222', 'Av. Comercial 321', 'Cochabamba'), ('ElectroSuministros', 'Roberto López', 'ventas@electrosum.bo', '7223333', 'Calle Comercio 654', 'Santa Cruz');

INSERT INTO productos (nombre, descripcion, categoria, precio, precio_compra, stock, icono, imagen) VALUES
('Cemento Portland 50kg', 'Saco de cemento Portland CPN 50kg de alta resistencia', 'Materiales de Construcción', 45.00, 35.00, 200, '🏗️', '/images/productos/Cemento_Portland_50kg.jpg'),
('Varilla 3/8" (12m)', 'Varilla de acero corrugada 3/8 pulgadas, largo 12 metros', 'Materiales de Construcción', 28.50, 22.00, 150, '🔩', '/images/productos/Varilla_38_(12m).jpg'),
('Ladrillo Fiscal', 'Ladrillo fiscal 18x18x18cm, alta resistencia', 'Materiales de Construcción', 2.80, 2.00, 5000, '🧱', '/images/productos/Ladrillo_Fiscal.jpg'),
('Martillo Stanley 16oz', 'Martillo de uña Stanley con mango de fibra de vidrio', 'Herramientas', 65.00, 48.00, 35, '🔨', '/images/productos/Martillo_Stanley_16oz.jpg'),
('Taladro Bosch 500W', 'Taladro eléctrico Bosch GSB 500W con maletín', 'Herramientas', 450.00, 350.00, 15, '⚡', '/images/productos/Taladro_Bosch_500W.jpg'),
('Cable THW 2.5mm (100m)', 'Cable eléctrico THW 2.5mm² rollo de 100 metros', 'Electricidad', 180.00, 140.00, 40, '🔌', '/images/productos/Cable_THW_2.5mm_(100m).jpg'),
('Tubo PVC 2" (6m)', 'Tubo PVC sanitario 2 pulgadas, largo 6 metros', 'Plomería', 32.00, 25.00, 80, '🚿', '/images/productos/Tubo_PVC_2_(6m).png'),
('Pintura Látex 20L', 'Pintura látex interior/exterior color blanco, balde 20L', 'Pinturas', 220.00, 175.00, 25, '🎨', '/images/productos/Pintura_Látex_20L.jpg'),
('Clavo 2" (1kg)', 'Clavo de acero galvanizado 2 pulgadas, bulto de 1kg', 'Ferretería General', 12.00, 9.00, 300, '📌', '/images/productos/Clavo_2_(1kg).jpg'),
('Cemento CPN 50kg', 'Saco de cemento CPN 50kg marca F', 'Materiales de Construcción', 42.00, 33.00, 180, '🏗️', '/images/productos/Cemento_CPN_50kg.jpg'),
('Cinta Métrica 5m', 'Cinta métrica Stanley 5 metros con auto-lock', 'Herramientas', 25.00, 18.00, 60, '📏', '/images/productos/Cinta_Métrica_5m.jpg'),
('Interruptor Simple', 'Interruptor simple polarizado blanco 10A', 'Electricidad', 8.50, 6.00, 200, '💡', '/images/productos/Interruptor_Simple.jpg'),
('Llave de paso 1/2"', 'Llave de paso cromada 1/2 pulgada', 'Plomería', 18.00, 13.00, 90, '🔧', '/images/productos/Llave_de_paso_12.jpg'),
('Impermeabilizante 20L', 'Impermeabilizante para techos color terracota 20L', 'Pinturas', 185.00, 145.00, 20, '🌧️', '/images/productos/Impermeabilizante_20L.jpg'),
('Destornillador Phillips', 'Destornillador Phillips #2 mango ergonómico', 'Herramientas', 15.00, 10.00, 75, '🪛', '/images/productos/Destornillador_Phillips.webp'),
('Cable THW 4mm (100m)', 'Cable eléctrico THW 4mm² rollo 100m', 'Electricidad', 290.00, 230.00, 25, '🔌', '/images/productos/Cable_THW_4mm_(100m).jpg'),
('Llave Inglesa 12"', 'Llave inglesa ajustable 12 pulgadas cromada', 'Herramientas', 55.00, 40.00, 45, '🔧', '/images/productos/Llave_Inglesa_12.png'),
('Malla Gallinero', 'Malla galvanizada gallinero 1x25m rollo', 'Ferretería General', 75.00, 58.00, 30, '🪤', '/images/productos/Malla_Gallinero.jpg'),
('Silicona Transparente', 'Silicona selladora transparente 300ml', 'Plomería', 15.00, 11.00, 100, '🧴', '/images/productos/Silicona_Transparente.jpg'),
('Disco de Corte 7"', 'Disco de corte para amoladora 7 pulgadas metal', 'Herramientas', 22.00, 16.00, 55, '💿', '/images/productos/Disco_de_Corte_7.jpg'),
('Sierra Circular Makita 7-1/4"', 'Sierra circular profesional Makita 7-1/4 pulgadas 1200W con maletín de transporte', 'Herramientas', 650.00, 500.00, 12, '🪚', '/images/productos/Sierra_Circular_Makita.jpg'),
('Lijadora Orbital Bosch 250W', 'Lijadora orbital Bosch GEX 250W con sistema de extracción de polvo', 'Herramientas', 380.00, 290.00, 10, '🖌️', '/images/productos/Lijadora_Orbital_Bosch.jpg'),
('Nivel de Burbuja 60cm', 'Nivel de burbuja de aluminio 60cm con 3 viales de precisión', 'Herramientas', 35.00, 25.00, 40, '📏', '/images/productos/Nivel_de_Burbuja_60cm.jpg'),
('Llave Allen Set 9 pzs', 'Set de llaves Allen métricas 1.5-10mm con soporte organizador', 'Herramientas', 25.00, 18.00, 50, '🔧', '/images/productos/Llave_Allen_Set_9_pzs.jpg'),
('Cinta Adhesiva Multiuso 50m', 'Cinta adhesiva multiuso resistente 50 metros x 48mm', 'Ferretería General', 15.00, 10.00, 80, '📎', '/images/productos/Cinta_Adhesiva_50m.jpg'),
('Bomba de Agua 1HP', 'Bomba de agua centrífuga 1HP para uso doméstico y riego', 'Plomería', 520.00, 400.00, 8, '🚿', '/images/productos/Bomba_de_Agua_1HP.png'),
('Foco LED 15W', 'Foco LED 15W luz blanca 6000K equivalente a 100W incandescente', 'Electricidad', 12.00, 8.00, 150, '💡', '/images/productos/Foco_LED_15W.jpg'),
('Cerradura Puerta Seguridad', 'Cerradura de seguridad para puerta principal con 3 llaves', 'Ferretería General', 85.00, 65.00, 20, '🔒', '/images/productos/Cerradura_Seguridad.jpg'),
('Bisagra Premium Acero', 'Bisagra de acero inoxidable premium 4" con tornillos incluidos', 'Ferretería General', 18.00, 12.00, 60, '🔩', '/images/productos/Bisagra_Premium_4.webp'),
('Tornillo Para Madera 3" (kg)', 'Tornillo para madera 3 pulgadas galvanizado, bolsa de 1kg', 'Ferretería General', 22.00, 16.00, 100, '🔩', '/images/productos/Tornillo_Madera_3_(kg).jpg'),
('Pegamento PVC 250ml', 'Pegamento adhesivo para tubería PVC 250ml', 'Plomería', 20.00, 14.00, 50, '🧴', '/images/productos/Pegamento_PVC_250ml.jpg'),
('Grifo Cocina Cromado', 'Grifo de cocina cromado monocomando con aireador', 'Plomería', 95.00, 72.00, 15, '🚿', '/images/productos/Grifo_Cocina.jpg'),
('Flexómetro 5m', 'Flexómetro profesional 5 metros con cinta metálica', 'Herramientas', 28.00, 20.00, 35, '📏', '/images/productos/Flexómetro_5m.jpg'),
('Destornillador Set 6 pzs', 'Set de destornilladores 6 piezas con mangos ergonómicos', 'Herramientas', 45.00, 33.00, 25, '🪛', '/images/productos/Destornillador_Set_6_pzs.jpg'),
('Brocha 4" Profesional', 'Brocha profesional de cerda 4 pulgadas para pintura látex', 'Pinturas', 18.00, 12.00, 45, '🎨', '/images/productos/Brocha_4_Profesional.jpg');

CREATE INDEX IF NOT EXISTS IX_users_email ON users(email);
CREATE INDEX IF NOT EXISTS IX_users_rol ON users(rol);
CREATE INDEX IF NOT EXISTS IX_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS IX_productos_nombre ON productos(nombre);
CREATE INDEX IF NOT EXISTS IX_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS IX_pedidos_codigo ON pedidos(codigo);
CREATE INDEX IF NOT EXISTS IX_pedidos_cliente ON pedidos(cliente);
CREATE INDEX IF NOT EXISTS IX_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS IX_ventas_estado ON ventas(estado);

-- Seed data for pedidos (10 example orders)
INSERT INTO pedidos (codigo, cliente_id, cliente, email, telefono, direccion, items, subtotal, impuesto, total, tipo, estado, pago, metodo_pago, notas, creado_por, created_at) VALUES
('#P-1718000001', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
 '[{\"producto_id\":1,\"nombre\":\"Cemento Portland 50kg\",\"cantidad\":20,\"precio\":45.00},{\"producto_id\":2,\"nombre\":\"Varilla 3/8 (12m)\",\"cantidad\":15,\"precio\":28.50},{\"producto_id\":3,\"nombre\":\"Ladrillo Fiscal\",\"cantidad\":500,\"precio\":2.80}]'::jsonb,
 2727.50, 0, 2727.50, 'tienda', 'Pendiente', 'Pendiente', 'Transferencia', 'Pedido grande para obra en construcción', 1, '2026-06-01 09:15:00'),
('#P-1718000002', 2, 'Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789, Santa Cruz',
 '[{\"producto_id\":4,\"nombre\":\"Martillo Stanley 16oz\",\"cantidad\":5,\"precio\":65.00},{\"producto_id\":5,\"nombre\":\"Taladro Bosch 500W\",\"cantidad\":2,\"precio\":450.00},{\"producto_id\":11,\"nombre\":\"Cinta Métrica 5m\",\"cantidad\":10,\"precio\":25.00}]'::jsonb,
 1548.75, 73.75, 1548.75, 'tienda', 'En Proceso', 'Pendiente', 'Efectivo', 'Urgente — necesitan para proyecto en curso', 2, '2026-06-02 11:30:00'),
('#P-1718000003', 3, 'Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123, Santa Cruz',
 '[{\"producto_id\":6,\"nombre\":\"Cable THW 2.5mm (100m)\",\"cantidad\":3,\"precio\":180.00},{\"producto_id\":12,\"nombre\":\"Interruptor Simple\",\"cantidad\":20,\"precio\":8.50},{\"producto_id\":29,\"nombre\":\"Foco LED 15W\",\"cantidad\":30,\"precio\":12.00}]'::jsonb,
 1123.50, 53.50, 1123.50, 'pos', 'Completado', 'Pagado', 'Tarjeta', 'Entregado en mostrador', 2, '2026-05-28 16:45:00'),
('#P-1718000004', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
 '[{\"producto_id\":6,\"nombre\":\"Cable THW 2.5mm (100m)\",\"cantidad\":5,\"precio\":180.00},{\"producto_id\":16,\"nombre\":\"Cable THW 4mm (100m)\",\"cantidad\":3,\"precio\":290.00},{\"producto_id\":20,\"nombre\":\"Disco de Corte 7\",\"cantidad\":10,\"precio\":22.00}]'::jsonb,
 2089.50, 99.50, 2089.50, 'tienda', 'Despachado', 'Pagado', 'Transferencia', 'Enviado por transportista', 1, '2026-05-25 10:00:00'),
('#P-1718000005', 2, 'Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789, Santa Cruz',
 '[{\"producto_id\":7,\"nombre\":\"Tubo PVC 2 (6m)\",\"cantidad\":10,\"precio\":32.00},{\"producto_id\":19,\"nombre\":\"Silicona Transparente\",\"cantidad\":5,\"precio\":15.00},{\"producto_id\":34,\"nombre\":\"Cemento CPN 50kg\",\"cantidad\":10,\"precio\":42.00}]'::jsonb,
 855.75, 40.75, 855.75, 'pos', 'Cancelado', 'Pendiente', 'Efectivo', 'Cliente canceló — pidió presupuesto nuevo', 2, '2026-05-20 14:20:00'),
('#P-1718000006', 3, 'Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123, Santa Cruz',
 '[{\"producto_id\":8,\"nombre\":\"Pintura Látex 20L\",\"cantidad\":4,\"precio\":220.00},{\"producto_id\":14,\"nombre\":\"Impermeabilizante 20L\",\"cantidad\":2,\"precio\":185.00},{\"producto_id\":38,\"nombre\":\"Brocha 4 Profesional\",\"cantidad\":8,\"precio\":18.00}]'::jsonb,
 1463.70, 69.70, 1463.70, 'tienda', 'Preparación', 'Pendiente', 'Tarjeta', 'Preparando para despacho', 2, '2026-06-05 08:00:00'),
('#P-1718000007', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
 '[{\"producto_id\":7,\"nombre\":\"Tubo PVC 2 (6m)\",\"cantidad\":15,\"precio\":32.00},{\"producto_id\":25,\"nombre\":\"Bomba de Agua 1HP\",\"cantidad\":1,\"precio\":520.00},{\"producto_id\":33,\"nombre\":\"Grifo Cocina\",\"cantidad\":3,\"precio\":95.00}]'::jsonb,
 1349.25, 64.25, 1349.25, 'tienda', 'Completado', 'Pagado', 'Transferencia', 'Entregado completo', 1, '2026-05-15 12:00:00'),
('#P-1718000008', 2, 'Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789, Santa Cruz',
 '[{\"producto_id\":5,\"nombre\":\"Taladro Bosch 500W\",\"cantidad\":1,\"precio\":450.00},{\"producto_id\":17,\"nombre\":\"Llave Inglesa 12\",\"cantidad\":4,\"precio\":55.00},{\"producto_id\":20,\"nombre\":\"Disco de Corte 7\",\"cantidad\":10,\"precio\":22.00},{\"producto_id\":24,\"nombre\":\"Nivel de Burbuja 60cm\",\"cantidad\":3,\"precio\":35.00}]'::jsonb,
 1044.75, 49.75, 1044.75, 'tienda', 'En Proceso', 'Pagado', 'Efectivo', 'Pagaron, estamos preparando el pedido', 2, '2026-06-08 09:30:00'),
('#P-1718000009', 3, 'Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123, Santa Cruz',
 '[{\"producto_id\":30,\"nombre\":\"Sierra Circular Makita\",\"cantidad\":1,\"precio\":650.00},{\"producto_id\":31,\"nombre\":\"Lijadora Orbital Bosch\",\"cantidad\":1,\"precio\":380.00}]'::jsonb,
 1081.50, 51.50, 1081.50, 'tienda', 'Pendiente', 'Pendiente', 'Transferencia', 'Esperando confirmación de pago', 1, '2026-06-10 07:15:00'),
('#P-1718000010', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
 '[{\"producto_id\":10,\"nombre\":\"Clavo 2 (1kg)\",\"cantidad\":5,\"precio\":12.00},{\"producto_id\":35,\"nombre\":\"Tornillo Madera 3 (kg)\",\"cantidad\":3,\"precio\":22.00},{\"producto_id\":28,\"nombre\":\"Cerradura Seguridad\",\"cantidad\":2,\"precio\":85.00}]'::jsonb,
 310.80, 14.80, 310.80, 'pos', 'Completado', 'Pagado', 'Tarjeta', 'Compra en mostrador', 2, '2026-06-09 17:50:00')
ON CONFLICT (codigo) DO NOTHING;

-- Seed data for cotizaciones (8 example quotations)
INSERT INTO cotizaciones (codigo, cliente_id, cliente, items, subtotal, impuesto, total, validez_dias, notas, estado, creado_por, created_at) VALUES
('#C-1719000001', 1, 'Constructora Los Andes',
 '[{"producto_id":1,"nombre":"Cemento Portland 50kg","cantidad":50,"precio":45.00},{"producto_id":2,"nombre":"Varilla 3/8 (12m)","cantidad":30,"precio":28.50},{"producto_id":3,"nombre":"Ladrillo Fiscal","cantidad":1000,"precio":2.80}]'::jsonb,
 5905.00, 295.25, 6200.25, 30, 'Cotización para obra de edificio en Zona Norte', 'Pendiente', 1, '2026-06-08 10:00:00'),
('#C-1719000002', 2, 'Ingeniería Santa Cruz',
 '[{"producto_id":5,"nombre":"Taladro Bosch 500W","cantidad":3,"precio":450.00},{"producto_id":4,"nombre":"Martillo Stanley 16oz","cantidad":10,"precio":65.00},{"producto_id":11,"nombre":"Cinta Métrica 5m","cantidad":15,"precio":25.00},{"producto_id":20,"nombre":"Disco de Corte 7","cantidad":25,"precio":22.00}]'::jsonb,
 2925.00, 146.25, 3071.25, 15, 'Herramientas para cuadrilla de 5 personas', 'Aprobada', 2, '2026-06-06 14:30:00'),
('#C-1719000003', 3, 'Distribuidora Norte',
 '[{"producto_id":8,"nombre":"Pintura Látex 20L","cantidad":10,"precio":220.00},{"producto_id":14,"nombre":"Impermeabilizante 20L","cantidad":5,"precio":185.00},{"producto_id":35,"nombre":"Brocha 4 Profesional","cantidad":20,"precio":18.00}]'::jsonb,
 3485.00, 174.25, 3659.25, 30, 'Presupuesto para pintar fábrica completa', 'Pendiente', 1, '2026-06-09 09:00:00'),
('#C-1719000004', 1, 'Constructora Los Andes',
 '[{"producto_id":6,"nombre":"Cable THW 2.5mm (100m)","cantidad":8,"precio":180.00},{"producto_id":16,"nombre":"Cable THW 4mm (100m)","cantidad":5,"precio":290.00},{"producto_id":12,"nombre":"Interruptor Simple","cantidad":40,"precio":8.50},{"producto_id":27,"nombre":"Foco LED 15W","cantidad":60,"precio":12.00}]'::jsonb,
 3950.00, 197.50, 4147.50, 20, 'Instalación eléctrica completa — 5 pisos', 'Revisión', 2, '2026-06-10 11:00:00'),
('#C-1719000005', 2, 'Ingeniería Santa Cruz',
 '[{"producto_id":7,"nombre":"Tubo PVC 2 (6m)","cantidad":30,"precio":32.00},{"producto_id":31,"nombre":"Pegamento PVC 250ml","cantidad":10,"precio":20.00},{"producto_id":32,"nombre":"Grifo Cocina Cromado","cantidad":8,"precio":95.00},{"producto_id":26,"nombre":"Bomba de Agua 1HP","cantidad":2,"precio":520.00}]'::jsonb,
 2960.00, 148.00, 3108.00, 30, 'Material sanitario para proyecto residencial', 'Pendiente', 1, '2026-06-10 15:00:00'),
('#C-1719000006', 3, 'Distribuidora Norte',
 '[{"producto_id":21,"nombre":"Sierra Circular Makita 7-1/4","cantidad":2,"precio":650.00},{"producto_id":22,"nombre":"Lijadora Orbital Bosch 250W","cantidad":2,"precio":380.00},{"producto_id":5,"nombre":"Taladro Bosch 500W","cantidad":4,"precio":450.00}]'::jsonb,
 3860.00, 193.00, 4053.00, 15, 'Equipamiento para taller de carpintería', 'Aprobada', 2, '2026-06-07 08:30:00'),
('#C-1719000007', 1, 'Constructora Los Andes',
 '[{"producto_id":10,"nombre":"Cemento CPN 50kg","cantidad":100,"precio":42.00},{"producto_id":3,"nombre":"Ladrillo Fiscal","cantidad":2000,"precio":2.80},{"producto_id":1,"nombre":"Cemento Portland 50kg","cantidad":80,"precio":45.00}]'::jsonb,
 13400.00, 670.00, 14070.00, 30, 'Materiales para obra gris — proyecto puente', 'Vencida', 1, '2026-05-20 10:00:00'),
('#C-1719000008', 2, 'Ingeniería Santa Cruz',
 '[{"producto_id":28,"nombre":"Cerradura Puerta Seguridad","cantidad":12,"precio":85.00},{"producto_id":29,"nombre":"Bisagra Premium Acero","cantidad":48,"precio":18.00},{"producto_id":30,"nombre":"Tornillo Para Madera 3 (kg)","cantidad":10,"precio":22.00}]'::jsonb,
  2104.00, 105.20, 2209.20, 30, 'Cotización para proyecto de 12 departamentos', 'Rechazada', 2, '2026-05-25 16:00:00')
ON CONFLICT (codigo) DO NOTHING;

-- Seed data for ventas (linked to existing pedidos)
INSERT INTO ventas (pedido_id, vendedor_id, cliente_id, total, metodo_pago, notas, estado, created_at) VALUES
(1, 2, 1, 2727.50, 'Transferencia', 'Venta completada - materiales de construcción', 'Completada', '2026-06-03 10:30:00'),
(3, 2, 3, 1123.50, 'Efectivo', 'Venta en mostrador - herramientas menores', 'Completada', '2026-06-04 15:00:00'),
(4, 1, 1, 2089.50, 'Efectivo', 'Venta de materiales para obra', 'Completada', '2026-06-05 09:15:00'),
(7, 2, 1, 1349.25, 'Tarjeta', 'Pago con tarjeta de crédito', 'Completada', '2026-06-07 11:45:00'),
(9, 1, 3, 1081.50, 'Transferencia', 'Transferencia bancaria confirmada', 'Completada', '2026-06-09 14:20:00'),
(10, 2, 1, 310.80, 'Efectivo', 'Venta rápida en POS', 'Completada', '2026-06-10 16:00:00'),
(2, 1, 2, 1548.75, 'Depósito', 'Pendiente de confirmación de depósito', 'Pendiente', '2026-06-02 08:00:00'),
(8, 2, 2, 1044.75, 'QR', 'Pago vía QR pendiente', 'Pendiente', '2026-06-08 10:00:00'),
(6, 1, 3, 1463.70, 'Depósito', 'Esperando confirmación del banco', 'Pendiente', '2026-06-06 08:30:00')
ON CONFLICT DO NOTHING;

-- Seed data for pagos_cobros (payments and collections)
INSERT INTO pagos_cobros (tipo, referencia_id, referencia_tipo, monto, metodo, concepto, cliente, estado, created_at) VALUES
('Cobro', 1, 'venta', 2727.50, 'Transferencia', 'Cobro venta #1 - Constructora Los Andes', 'Constructora Los Andes', 'Cobrado', '2026-06-03 10:35:00'),
('Cobro', 3, 'venta', 1123.50, 'Efectivo', 'Cobro venta #3 - Distribuidora Norte', 'Distribuidora Norte', 'Cobrado', '2026-06-04 15:05:00'),
('Cobro', 4, 'venta', 2089.50, 'Efectivo', 'Cobro venta #4 - Constructora Los Andes', 'Constructora Los Andes', 'Cobrado', '2026-06-05 09:20:00'),
('Cobro', 7, 'venta', 1349.25, 'Tarjeta', 'Cobro venta #7 - Constructora Los Andes', 'Constructora Los Andes', 'Cobrado', '2026-06-07 11:50:00'),
('Cobro', 9, 'venta', 1081.50, 'Transferencia', 'Cobro venta #9 - Distribuidora Norte', 'Distribuidora Norte', 'Cobrado', '2026-06-09 14:25:00'),
('Cobro', 10, 'venta', 310.80, 'Efectivo', 'Cobro venta #10 - Constructora Los Andes', 'Constructora Los Andes', 'Cobrado', '2026-06-10 16:05:00'),
('Pago', NULL, NULL, 4500.00, 'Transferencia', 'Pago a proveedor Aceros del Sur', 'Aceros del Sur', 'Pagado', '2026-06-01 10:00:00'),
('Pago', NULL, NULL, 1200.00, 'Efectivo', 'Pago de servicios de logística', 'Logística ABC', 'Pagado', '2026-06-05 09:00:00'),
('Pago', NULL, NULL, 2800.00, 'Transferencia', 'Pago a Ferretería El Tornillo', 'Ferretería El Tornillo', 'Pagado', '2026-06-08 11:30:00'),
('Cobro', 2, 'venta', 1548.75, 'Depósito', 'Pendiente de cobro - Ingeniería Santa Cruz', 'Ingeniería Santa Cruz', 'Pendiente', '2026-06-02 08:05:00'),
('Cobro', 8, 'venta', 1044.75, 'QR', 'Pendiente de cobro - Ingeniería Santa Cruz', 'Ingeniería Santa Cruz', 'Pendiente', '2026-06-08 10:05:00'),
('Cobro', 6, 'venta', 1463.70, 'Depósito', 'Pendiente de cobro - Distribuidora Norte', 'Distribuidora Norte', 'Pendiente', '2026-06-06 08:35:00'),
('Pago', NULL, NULL, 800.00, 'Efectivo', 'Pago de mantenimiento de equipos', 'ServiTec', 'Pendiente', '2026-06-10 15:00:00');
