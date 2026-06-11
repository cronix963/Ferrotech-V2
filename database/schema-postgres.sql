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
CREATE TABLE IF NOT EXISTS pagos_cobros (id SERIAL PRIMARY KEY, tipo VARCHAR(50) NOT NULL, referencia_id INTEGER, referencia_tipo VARCHAR(50), monto NUMERIC(12,2) NOT NULL DEFAULT 0, metodo VARCHAR(50) NOT NULL, concepto VARCHAR(500), registrado_por INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW(), FOREIGN KEY (registrado_por) REFERENCES users(id));

INSERT INTO categorias (nombre, descripcion, icono) VALUES ('Materiales de Construcción', 'Cemento, varillas, ladrillos', '🏗️'), ('Ferretería General', 'Clavos, herramientas', '🔧'), ('Electricidad', 'Cables, interruptores', '⚡'), ('Plomería', 'Tuberías PVC', '🚿'), ('Pinturas', 'Látex, acabados', '🎨'), ('Herramientas', 'Herramientas profesionales', '🔨'), ('Seguridad', 'Equipos de protección', '🦺'), ('Jardín', 'Riego, exterior', '🌿') ON CONFLICT DO NOTHING;

INSERT INTO users (email, password_hash, nombre, rol, provider, activo) VALUES ('admin@ferrotech.bo', '$2b$10$dE7kHORurC50Yjfh0NEoFuAH9fKvfn0.8GS/fQoyWxjob2oe.nGUW', 'Administrador', 'admin', 'credentials', TRUE) ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password_hash, nombre, rol, provider, activo) VALUES ('vendedor@ferrotech.bo', '$2b$10$pA3pJJi0Rdq/Fz0Rlx.H7.7x9NImO8wDBtmEM8r25u8FkDrwaISaG', 'Carlos Vendedor', 'vendedor', 'credentials', TRUE) ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, nombre, rol, provider, activo) VALUES ('cronix963@gmail.com', 'Miguel Fernandez', 'admin', 'google', TRUE) ON CONFLICT (email) DO NOTHING;

INSERT INTO clientes (nombre, email, telefono, direccion, ciudad, nit, empresa) VALUES ('Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456', 'Santa Cruz', '12345678', 'Los Andes S.A.'), ('Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789', 'Santa Cruz', '87654321', 'Ing. SC Ltda.'), ('Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123', 'Santa Cruz', '11223344', 'Dis. Norte S.R.L.');

INSERT INTO proveedores (nombre, contacto, email, telefono, direccion, ciudad) VALUES ('Cemento F', 'Juan Pérez', 'ventas@cementof.bo', '7221111', 'Zona Industrial', 'La Paz'), ('Herramientas Pro', 'María García', 'info@herramientaspro.bo', '7222222', 'Av. Comercial 321', 'Cochabamba'), ('ElectroSuministros', 'Roberto López', 'ventas@electrosum.bo', '7223333', 'Calle Comercio 654', 'Santa Cruz');

INSERT INTO productos (nombre, descripcion, categoria, precio, precio_compra, stock, icono, imagen) VALUES
('Cemento Portland 50kg', 'Saco de cemento Portland CPN 50kg', 'Materiales de Construcción', 45.00, 35.00, 200, '🏗️', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop'),
('Varilla 3/8" (12m)', 'Varilla de acero corrugada 3/8', 'Materiales de Construcción', 28.50, 22.00, 150, '🔩', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop'),
('Ladrillo Fiscal', 'Ladrillo fiscal 18x18x18cm', 'Materiales de Construcción', 2.80, 2.00, 5000, '🧱', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7e0d?w=400&h=300&fit=crop'),
('Martillo Stanley 16oz', 'Martillo de uña Stanley', 'Herramientas', 65.00, 48.00, 35, '🔨', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop'),
('Taladro Bosch 500W', 'Taladro eléctrico Bosch GSB 500W', 'Herramientas', 450.00, 350.00, 15, '⚡', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'),
('Cable THW 2.5mm (100m)', 'Cable eléctrico THW 2.5mm²', 'Electricidad', 180.00, 140.00, 40, '🔌', 'https://images.unsplash.com/photo-1544724107-6d5c4caaff30?w=400&h=300&fit=crop'),
('Tubo PVC 2" (6m)', 'Tubo PVC sanitario 2"', 'Plomería', 32.00, 25.00, 80, '🚿', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop'),
('Pintura Látex 20L', 'Pintura látex interior/exterior', 'Pinturas', 220.00, 175.00, 25, '🎨', 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=300&fit=crop'),
('Clavo 2" (1kg)', 'Clavo de acero galvanizado', 'Ferretería General', 12.00, 9.00, 300, '📌', 'https://images.unsplash.com/photo-1590247813695-6b1aee4a77d8?w=400&h=300&fit=crop'),
('Cemento CPN 50kg', 'Saco de cemento CPN 50kg marca F', 'Materiales de Construcción', 42.00, 33.00, 180, '🏗️', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop'),
('Cinta Métrica 5m', 'Cinta métrica Stanley 5m', 'Herramientas', 25.00, 18.00, 60, '📏', 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=400&h=300&fit=crop'),
('Interruptor Simple', 'Interruptor simple polarizado 10A', 'Electricidad', 8.50, 6.00, 200, '💡', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop'),
('Llave de paso 1/2"', 'Llave de paso cromada 1/2"', 'Plomería', 18.00, 13.00, 90, '🔧', 'https://images.unsplash.com/photo-1527612820676-9e2e38a2130a?w=400&h=300&fit=crop'),
('Impermeabilizante 20L', 'Impermeabilizante para techos', 'Pinturas', 185.00, 145.00, 20, '🌧️', 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=300&fit=crop'),
('Destornillador Phillips', 'Destornillador Phillips #2', 'Herramientas', 15.00, 10.00, 75, '🪛', 'https://images.unsplash.com/photo-1586864387634-2f14c5e36a1a?w=400&h=300&fit=crop'),
('Cable THW 4mm (100m)', 'Cable eléctrico THW 4mm²', 'Electricidad', 290.00, 230.00, 25, '🔌', 'https://images.unsplash.com/photo-1544724107-6d5c4caaff30?w=400&h=300&fit=crop'),
('Llave Inglesa 12"', 'Llave inglesa ajustable 12"', 'Herramientas', 55.00, 40.00, 45, '🔧', 'https://images.unsplash.com/photo-1527612820676-9e2e38a2130a?w=400&h=300&fit=crop'),
('Malla Gallinero', 'Malla galvanizada 1x25m', 'Ferretería General', 75.00, 58.00, 30, '🪤', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=300&fit=crop'),
('Silicona Transparente', 'Silicona selladora 300ml', 'Plomería', 15.00, 11.00, 100, '🧴', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop'),
('Disco de Corte 7"', 'Disco de corte amoladora 7"', 'Herramientas', 22.00, 16.00, 55, '💿', 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&h=300&fit=crop'),
('Sierra Circular Makita', 'Sierra circular Makita 1200W', 'Herramientas', 650.00, 500.00, 12, '🪚', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&h=300&fit=crop'),
('Lijadora Orbital Bosch', 'Lijadora orbital Bosch 250W', 'Herramientas', 380.00, 290.00, 10, '🖌️', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'),
('Nivel de Burbuja 60cm', 'Nivel aluminio 60cm 3 viales', 'Herramientas', 35.00, 25.00, 40, '📏', 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=400&h=300&fit=crop'),
('Llave Allen Set 9 pzs', 'Set llaves Allen 1.5-10mm', 'Herramientas', 25.00, 18.00, 50, '🔧', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=300&fit=crop'),
('Cinta Adhesiva 50m', 'Cinta adhesiva multiuso 50m', 'Ferretería General', 15.00, 10.00, 80, '📎', 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400&h=300&fit=crop'),
('Bomba de Agua 1HP', 'Bomba centrífuga 1HP', 'Plomería', 520.00, 400.00, 8, '🚿', 'https://images.unsplash.com/photo-1527612820676-9e2e38a2130a?w=400&h=300&fit=crop'),
('Foco LED 15W', 'Foco LED 15W 6000K', 'Electricidad', 12.00, 8.00, 150, '💡', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop'),
('Cerradura Seguridad', 'Cerradura puerta con 3 llaves', 'Ferretería General', 85.00, 65.00, 20, '🔒', 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&h=300&fit=crop'),
('Bisagra Premium 4"', 'Bisagra acero inoxidable 4"', 'Ferretería General', 18.00, 12.00, 60, '🔩', 'https://images.unsplash.com/photo-1586864387634-2f14c5e36a1a?w=400&h=300&fit=crop'),
('Tornillo Madera 3" (kg)', 'Tornillo madera galvanizado 1kg', 'Ferretería General', 22.00, 16.00, 100, '🔩', 'https://images.unsplash.com/photo-1586864387634-2f14c5e36a1a?w=400&h=300&fit=crop'),
('Pegamento PVC 250ml', 'Adhesivo tubería PVC 250ml', 'Plomería', 20.00, 14.00, 50, '🧴', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop'),
('Grifo Cocina', 'Grifo cromado monocomando', 'Plomería', 95.00, 72.00, 15, '🚿', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop'),
('Flexómetro 5m', 'Flexómetro profesional 5m', 'Herramientas', 28.00, 20.00, 35, '📏', 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=400&h=300&fit=crop'),
('Destornillador Set 6 pzs', 'Set destornilladores 6 piezas', 'Herramientas', 45.00, 33.00, 25, '🪛', 'https://images.unsplash.com/photo-1586864387634-2f14c5e36a1a?w=400&h=300&fit=crop'),
('Brocha 4" Profesional', 'Brocha cerda 4" para látex', 'Pinturas', 18.00, 12.00, 45, '🎨', 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=300&fit=crop');

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
