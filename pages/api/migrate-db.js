import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  try {
    const results = [];

    /* ─── 0. Crear tablas si no existen ─── */
    await query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, password_hash VARCHAR(255), nombre VARCHAR(255) NOT NULL, rol VARCHAR(50) NOT NULL DEFAULT 'cliente', avatar VARCHAR(500), google_id VARCHAR(255), provider VARCHAR(50) NOT NULL DEFAULT 'credentials', telefono VARCHAR(50), activo BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    await query(`CREATE TABLE IF NOT EXISTS categorias (id SERIAL PRIMARY KEY, nombre VARCHAR(255) NOT NULL, descripcion VARCHAR(500), icono VARCHAR(10) DEFAULT '📦', activo BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    await query(`CREATE TABLE IF NOT EXISTS clientes (id SERIAL PRIMARY KEY, user_id INTEGER, nombre VARCHAR(255) NOT NULL, email VARCHAR(255), telefono VARCHAR(50), direccion VARCHAR(500), ciudad VARCHAR(100), nit VARCHAR(50), empresa VARCHAR(255), total_compras INTEGER NOT NULL DEFAULT 0, total_gastado NUMERIC(12,2) NOT NULL DEFAULT 0, ultima_compra TIMESTAMP, notas TEXT, activo BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW(), FOREIGN KEY (user_id) REFERENCES users(id))`);
    await query(`CREATE TABLE IF NOT EXISTS productos (id SERIAL PRIMARY KEY, nombre VARCHAR(255) NOT NULL, descripcion TEXT, categoria_id INTEGER, categoria VARCHAR(100), precio NUMERIC(10,2) NOT NULL DEFAULT 0, precio_compra NUMERIC(10,2) DEFAULT 0, stock INTEGER NOT NULL DEFAULT 0, stock_minimo INTEGER NOT NULL DEFAULT 5, unidad VARCHAR(50) NOT NULL DEFAULT 'unidad', codigo_barras VARCHAR(100), codigo_interno VARCHAR(100), proveedor_id INTEGER, icono VARCHAR(10) DEFAULT '📦', imagen VARCHAR(500), activo BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    await query(`CREATE TABLE IF NOT EXISTS proveedores (id SERIAL PRIMARY KEY, nombre VARCHAR(255) NOT NULL, contacto VARCHAR(255), email VARCHAR(255), telefono VARCHAR(50), direccion VARCHAR(500), ciudad VARCHAR(100), notas TEXT, activo BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    await query(`CREATE TABLE IF NOT EXISTS pedidos (id SERIAL PRIMARY KEY, codigo VARCHAR(50) NOT NULL UNIQUE, cliente_id INTEGER, cliente VARCHAR(255) NOT NULL, email VARCHAR(255), telefono VARCHAR(50), direccion VARCHAR(500), items JSONB, subtotal NUMERIC(12,2) NOT NULL DEFAULT 0, impuesto NUMERIC(12,2) NOT NULL DEFAULT 0, total NUMERIC(12,2) NOT NULL DEFAULT 0, tipo VARCHAR(50) NOT NULL DEFAULT 'tienda', estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', pago VARCHAR(50) NOT NULL DEFAULT 'Pendiente', metodo_pago VARCHAR(50), notas TEXT, creado_por INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    await query(`CREATE TABLE IF NOT EXISTS ventas (id SERIAL PRIMARY KEY, pedido_id INTEGER, vendedor_id INTEGER, cliente_id INTEGER, total NUMERIC(12,2) NOT NULL DEFAULT 0, metodo_pago VARCHAR(50), estado VARCHAR(50) NOT NULL DEFAULT 'Completada', notas TEXT, created_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    await query(`CREATE TABLE IF NOT EXISTS compras (id SERIAL PRIMARY KEY, codigo VARCHAR(50) NOT NULL UNIQUE, proveedor_id INTEGER, proveedor VARCHAR(255) NOT NULL, items JSONB, total NUMERIC(12,2) NOT NULL DEFAULT 0, estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', notas TEXT, creado_por INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    await query(`CREATE TABLE IF NOT EXISTS cotizaciones (id SERIAL PRIMARY KEY, codigo VARCHAR(50) NOT NULL UNIQUE, cliente_id INTEGER, cliente VARCHAR(255) NOT NULL, items JSONB, subtotal NUMERIC(12,2) NOT NULL DEFAULT 0, impuesto NUMERIC(12,2) NOT NULL DEFAULT 0, total NUMERIC(12,2) NOT NULL DEFAULT 0, estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', validez_dias INTEGER NOT NULL DEFAULT 30, notas TEXT, creado_por INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    await query(`CREATE TABLE IF NOT EXISTS pagos_cobros (id SERIAL PRIMARY KEY, tipo VARCHAR(50) NOT NULL, referencia_id INTEGER, referencia_tipo VARCHAR(50), monto NUMERIC(12,2) NOT NULL DEFAULT 0, metodo VARCHAR(50) NOT NULL, concepto VARCHAR(500), cliente VARCHAR(255), estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', registrado_por INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    await query(`CREATE TABLE IF NOT EXISTS envios (id SERIAL PRIMARY KEY, pedido_id INTEGER, direccion VARCHAR(500) NOT NULL, ciudad VARCHAR(100), transportista VARCHAR(255), tracking_numero VARCHAR(100), estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', fecha_salida TIMESTAMP, fecha_entrega TIMESTAMP, notas TEXT, created_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    await query(`CREATE TABLE IF NOT EXISTS creditos (id SERIAL PRIMARY KEY, cliente_id INTEGER NOT NULL, cliente VARCHAR(255) NOT NULL, limite NUMERIC(12,2) NOT NULL DEFAULT 0, saldo NUMERIC(12,2) NOT NULL DEFAULT 0, plazo_dias INTEGER NOT NULL DEFAULT 30, interes_mora NUMERIC(5,2) NOT NULL DEFAULT 0, estado VARCHAR(50) NOT NULL DEFAULT 'Activo', notas TEXT, creado_por INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_at TIMESTAMP NOT NULL DEFAULT NOW())`);
    results.push('Tablas verificadas/creadas');

    /* ─── 0b. Seed de datos base (categorías, usuarios, clientes, productos) ─── */
    await query(`INSERT INTO categorias (nombre, descripcion, icono) SELECT 'Materiales de Construcción', 'Cemento, varillas, ladrillos y materiales para obra', '🏗️' WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre='Materiales de Construcción')`);
    // Insert categorias
    for (const c of [
      ['Materiales de Construcción', 'Cemento, varillas, ladrillos y materiales para obra', '🏗️'],
      ['Ferretería General', 'Clavos, herramientas manuales y accesorios', '🔧'],
      ['Electricidad', 'Cables, interruptores y material eléctrico', '⚡'],
      ['Plomería', 'Tuberías PVC, conexiones y accesorios sanitarios', '🚿'],
      ['Pinturas', 'Látex, impermeabilizantes y acabados', '🎨'],
      ['Herramientas', 'Herramientas manuales y eléctricas profesionales', '🔨'],
      ['Seguridad', 'Equipos de protección personal y seguridad', '🦺'],
      ['Jardín', 'Riego, herramientas de jardín y exterior', '🌿'],
    ]) {
      await query(`INSERT INTO categorias (nombre, descripcion, icono) SELECT $1,$2,$3 WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre=$1)`, c);
    }
    results.push('Categorías insertadas');

    // Insert users
    await query(`INSERT INTO users (email, password_hash, nombre, rol, provider, activo) SELECT 'admin@ferrotech.bo', '$2b$10$dE7kHORurC50Yjfh0NEoFuAH9fKvfn0.8GS/fQoyWxjob2oe.nGUW', 'Administrador', 'admin', 'credentials', TRUE WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='admin@ferrotech.bo')`);
    await query(`INSERT INTO users (email, password_hash, nombre, rol, provider, activo) SELECT 'vendedor@ferrotech.bo', '$2b$10$pA3pJJi0Rdq/Fz0Rlx.H7.7x9NImO8wDBtmEM8r25u8FkDrwaISaG', 'Carlos Vendedor', 'vendedor', 'credentials', TRUE WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='vendedor@ferrotech.bo')`);
    await query(`INSERT INTO users (email, nombre, rol, provider, activo) SELECT 'cronix963@gmail.com', 'Miguel Fernandez', 'admin', 'google', TRUE WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='cronix963@gmail.com')`);
    results.push('Usuarios insertados');

    // Insert clientes
    for (const c of [
      ['Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456', 'Santa Cruz', '12345678', 'Los Andes S.A.'],
      ['Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789', 'Santa Cruz', '87654321', 'Ing. SC Ltda.'],
      ['Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123', 'Santa Cruz', '11223344', 'Dis. Norte S.R.L.'],
    ]) {
      await query(`INSERT INTO clientes (nombre, email, telefono, direccion, ciudad, nit, empresa) SELECT $1,$2,$3,$4,$5,$6,$7 WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE email=$2)`, c);
    }
    results.push('Clientes insertados');

    // Insert proveedores
    for (const p of [
      ['Cemento F', 'Juan Pérez', 'ventas@cementof.bo', '7221111', 'Zona Industrial', 'La Paz'],
      ['Herramientas Pro', 'María García', 'info@herramientaspro.bo', '7222222', 'Av. Comercial 321', 'Cochabamba'],
      ['ElectroSuministros', 'Roberto López', 'ventas@electrosum.bo', '7223333', 'Calle Comercio 654', 'Santa Cruz'],
    ]) {
      await query(`INSERT INTO proveedores (nombre, contacto, email, telefono, direccion, ciudad) SELECT $1,$2,$3,$4,$5,$6 WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE email=$3)`, p);
    }
    results.push('Proveedores insertados');

    // Insert productos
    const productosSeed = [
      ['Cemento Portland 50kg', 'Saco de cemento Portland CPN 50kg de alta resistencia', 'Materiales de Construcción', 45.00, 35.00, 200, '🏗️', '/images/productos/Cemento_Portland_50kg.jpg'],
      ['Varilla 3/8" (12m)', 'Varilla de acero corrugada 3/8 pulgadas, largo 12 metros', 'Materiales de Construcción', 28.50, 22.00, 150, '🔩', '/images/productos/Varilla_38_(12m).jpg'],
      ['Ladrillo Fiscal', 'Ladrillo fiscal 18x18x18cm, alta resistencia', 'Materiales de Construcción', 2.80, 2.00, 5000, '🧱', '/images/productos/Ladrillo_Fiscal.jpg'],
      ['Martillo Stanley 16oz', 'Martillo de uña Stanley con mango de fibra de vidrio', 'Herramientas', 65.00, 48.00, 35, '🔨', '/images/productos/Martillo_Stanley_16oz.jpg'],
      ['Taladro Bosch 500W', 'Taladro eléctrico Bosch GSB 500W con maletín', 'Herramientas', 450.00, 350.00, 15, '⚡', '/images/productos/Taladro_Bosch_500W.jpg'],
      ['Cable THW 2.5mm (100m)', 'Cable eléctrico THW 2.5mm² rollo de 100 metros', 'Electricidad', 180.00, 140.00, 40, '🔌', '/images/productos/Cable_THW_2.5mm_(100m).jpg'],
      ['Tubo PVC 2" (6m)', 'Tubo PVC sanitario 2 pulgadas, largo 6 metros', 'Plomería', 32.00, 25.00, 80, '🚿', '/images/productos/Tubo_PVC_2_(6m).png'],
      ['Pintura Látex 20L', 'Pintura látex interior/exterior color blanco, balde 20L', 'Pinturas', 220.00, 175.00, 25, '🎨', '/images/productos/Pintura_Látex_20L.jpg'],
      ['Clavo 2" (1kg)', 'Clavo de acero galvanizado 2 pulgadas, bulto de 1kg', 'Ferretería General', 12.00, 9.00, 300, '📌', '/images/productos/Clavo_2_(1kg).jpg'],
      ['Cemento CPN 50kg', 'Saco de cemento CPN 50kg marca F', 'Materiales de Construcción', 42.00, 33.00, 180, '🏗️', '/images/productos/Cemento_CPN_50kg.jpg'],
      ['Cinta Métrica 5m', 'Cinta métrica Stanley 5 metros con auto-lock', 'Herramientas', 25.00, 18.00, 60, '📏', '/images/productos/Cinta_Métrica_5m.jpg'],
      ['Interruptor Simple', 'Interruptor simple polarizado blanco 10A', 'Electricidad', 8.50, 6.00, 200, '💡', '/images/productos/Interruptor_Simple.jpg'],
      ['Llave de paso 1/2"', 'Llave de paso cromada 1/2 pulgada', 'Plomería', 18.00, 13.00, 90, '🔧', '/images/productos/Llave_de_paso_12.jpg'],
      ['Impermeabilizante 20L', 'Impermeabilizante para techos color terracota 20L', 'Pinturas', 185.00, 145.00, 20, '🌧️', '/images/productos/Impermeabilizante_20L.jpg'],
      ['Destornillador Phillips', 'Destornillador Phillips #2 mango ergonómico', 'Herramientas', 15.00, 10.00, 75, '🪛', '/images/productos/Destornillador_Phillips.webp'],
      ['Cable THW 4mm (100m)', 'Cable eléctrico THW 4mm² rollo 100m', 'Electricidad', 290.00, 230.00, 25, '🔌', '/images/productos/Cable_THW_4mm_(100m).jpg'],
      ['Llave Inglesa 12"', 'Llave inglesa ajustable 12 pulgadas cromada', 'Herramientas', 55.00, 40.00, 45, '🔧', '/images/productos/Llave_Inglesa_12.png'],
      ['Malla Gallinero', 'Malla galvanizada gallinero 1x25m rollo', 'Ferretería General', 75.00, 58.00, 30, '🪤', '/images/productos/Malla_Gallinero.jpg'],
      ['Silicona Transparente', 'Silicona selladora transparente 300ml', 'Plomería', 15.00, 11.00, 100, '🧴', '/images/productos/Silicona_Transparente.jpg'],
      ['Disco de Corte 7"', 'Disco de corte para amoladora 7 pulgadas metal', 'Herramientas', 22.00, 16.00, 55, '💿', '/images/productos/Disco_de_Corte_7.jpg'],
    ];
    for (const p of productosSeed) {
      await query(`INSERT INTO productos (nombre, descripcion, categoria, precio, precio_compra, stock, icono, imagen) SELECT $1,$2,$3,$4,$5,$6,$7,$8 WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre=$1)`, p);
    }
    results.push('Productos insertados');

    /* ─── 0c. Seed de pedidos ─── */
    const pedidosSeed = [
      ['#P-1718000001', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
        '[{"producto_id":1,"nombre":"Cemento Portland 50kg","cantidad":20,"precio":45.00},{"producto_id":2,"nombre":"Varilla 3/8 (12m)","cantidad":15,"precio":28.50},{"producto_id":3,"nombre":"Ladrillo Fiscal","cantidad":500,"precio":2.80}]',
        2727.50, 0, 2727.50, 'tienda', 'Pendiente', 'Pendiente', 'Transferencia', 'Pedido grande para obra en construcción', 1, '2026-06-01 09:15:00'],
      ['#P-1718000002', 2, 'Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789, Santa Cruz',
        '[{"producto_id":4,"nombre":"Martillo Stanley 16oz","cantidad":5,"precio":65.00},{"producto_id":5,"nombre":"Taladro Bosch 500W","cantidad":2,"precio":450.00},{"producto_id":11,"nombre":"Cinta Métrica 5m","cantidad":10,"precio":25.00}]',
        1548.75, 73.75, 1548.75, 'tienda', 'En Proceso', 'Pendiente', 'Efectivo', 'Urgente — necesitan para proyecto en curso', 2, '2026-06-02 11:30:00'],
      ['#P-1718000003', 3, 'Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123, Santa Cruz',
        '[{"producto_id":6,"nombre":"Cable THW 2.5mm (100m)","cantidad":3,"precio":180.00},{"producto_id":12,"nombre":"Interruptor Simple","cantidad":20,"precio":8.50},{"producto_id":29,"nombre":"Foco LED 15W","cantidad":30,"precio":12.00}]',
        1123.50, 53.50, 1123.50, 'pos', 'Completado', 'Pagado', 'Tarjeta', 'Entregado en mostrador', 2, '2026-05-28 16:45:00'],
      ['#P-1718000004', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
        '[{"producto_id":6,"nombre":"Cable THW 2.5mm (100m)","cantidad":5,"precio":180.00},{"producto_id":16,"nombre":"Cable THW 4mm (100m)","cantidad":3,"precio":290.00},{"producto_id":20,"nombre":"Disco de Corte 7","cantidad":10,"precio":22.00}]',
        2089.50, 99.50, 2089.50, 'tienda', 'Despachado', 'Pagado', 'Transferencia', 'Enviado por transportista', 1, '2026-05-25 10:00:00'],
      ['#P-1718000005', 2, 'Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789, Santa Cruz',
        '[{"producto_id":7,"nombre":"Tubo PVC 2 (6m)","cantidad":10,"precio":32.00},{"producto_id":19,"nombre":"Silicona Transparente","cantidad":5,"precio":15.00},{"producto_id":34,"nombre":"Cemento CPN 50kg","cantidad":10,"precio":42.00}]',
        855.75, 40.75, 855.75, 'pos', 'Cancelado', 'Pendiente', 'Efectivo', 'Cliente canceló — pidió presupuesto nuevo', 2, '2026-05-20 14:20:00'],
      ['#P-1718000006', 3, 'Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123, Santa Cruz',
        '[{"producto_id":8,"nombre":"Pintura Látex 20L","cantidad":4,"precio":220.00},{"producto_id":14,"nombre":"Impermeabilizante 20L","cantidad":2,"precio":185.00},{"producto_id":38,"nombre":"Brocha 4 Profesional","cantidad":8,"precio":18.00}]',
        1463.70, 69.70, 1463.70, 'tienda', 'Preparación', 'Pendiente', 'Tarjeta', 'Preparando para despacho', 2, '2026-06-05 08:00:00'],
      ['#P-1718000007', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
        '[{"producto_id":7,"nombre":"Tubo PVC 2 (6m)","cantidad":15,"precio":32.00},{"producto_id":25,"nombre":"Bomba de Agua 1HP","cantidad":1,"precio":520.00},{"producto_id":33,"nombre":"Grifo Cocina","cantidad":3,"precio":95.00}]',
        1349.25, 64.25, 1349.25, 'tienda', 'Completado', 'Pagado', 'Transferencia', 'Entregado completo', 1, '2026-05-15 12:00:00'],
      ['#P-1718000008', 2, 'Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789, Santa Cruz',
        '[{"producto_id":5,"nombre":"Taladro Bosch 500W","cantidad":1,"precio":450.00},{"producto_id":17,"nombre":"Llave Inglesa 12","cantidad":4,"precio":55.00},{"producto_id":20,"nombre":"Disco de Corte 7","cantidad":10,"precio":22.00},{"producto_id":24,"nombre":"Nivel de Burbuja 60cm","cantidad":3,"precio":35.00}]',
        1044.75, 49.75, 1044.75, 'tienda', 'En Proceso', 'Pagado', 'Efectivo', 'Pagaron, estamos preparando el pedido', 2, '2026-06-08 09:30:00'],
      ['#P-1718000009', 3, 'Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123, Santa Cruz',
        '[{"producto_id":30,"nombre":"Sierra Circular Makita","cantidad":1,"precio":650.00},{"producto_id":31,"nombre":"Lijadora Orbital Bosch","cantidad":1,"precio":380.00}]',
        1081.50, 51.50, 1081.50, 'tienda', 'Pendiente', 'Pendiente', 'Transferencia', 'Esperando confirmación de pago', 1, '2026-06-10 07:15:00'],
      ['#P-1718000010', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
        '[{"producto_id":10,"nombre":"Clavo 2 (1kg)","cantidad":5,"precio":12.00},{"producto_id":35,"nombre":"Tornillo Madera 3 (kg)","cantidad":3,"precio":22.00},{"producto_id":28,"nombre":"Cerradura Seguridad","cantidad":2,"precio":85.00}]',
        310.80, 14.80, 310.80, 'pos', 'Completado', 'Pagado', 'Tarjeta', 'Compra en mostrador', 2, '2026-06-09 17:50:00'],
    ];
    let pedCount = 0;
    for (const p of pedidosSeed) {
      const r = await query(
        `INSERT INTO pedidos (codigo, cliente_id, cliente, email, telefono, direccion, items, subtotal, impuesto, total, tipo, estado, pago, metodo_pago, notas, creado_por, created_at) SELECT $1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17 WHERE NOT EXISTS (SELECT 1 FROM pedidos WHERE codigo=$1)`,
        p
      );
      pedCount += r.rowCount || 0;
    }
    results.push(`Pedidos insertados: ${pedCount}`);

    /* ─── 1. Actualizar imágenes de productos ─── */
    const imgUpdates = [
      `UPDATE productos SET imagen = '/images/productos/Cemento_Portland_50kg.jpg' WHERE nombre LIKE 'Cemento Portland%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Varilla_38_(12m).jpg' WHERE nombre LIKE 'Varilla 3/8%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Ladrillo_Fiscal.jpg' WHERE nombre LIKE 'Ladrillo Fiscal%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Martillo_Stanley_16oz.jpg' WHERE nombre LIKE 'Martillo Stanley%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Taladro_Bosch_500W.jpg' WHERE nombre LIKE 'Taladro Bosch%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Cable_THW_2.5mm_(100m).jpg' WHERE nombre LIKE 'Cable THW 2.5mm%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Tubo_PVC_2_(6m).png' WHERE nombre LIKE 'Tubo PVC%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Pintura_Látex_20L.jpg' WHERE nombre LIKE 'Pintura Látex%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Clavo_2_(1kg).jpg' WHERE nombre LIKE 'Clavo 2%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Cemento_CPN_50kg.jpg' WHERE nombre LIKE 'Cemento CPN%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Cinta_Métrica_5m.jpg' WHERE nombre LIKE 'Cinta Métrica%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Interruptor_Simple.jpg' WHERE nombre LIKE 'Interruptor Simple%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Llave_de_paso_12.jpg' WHERE nombre LIKE 'Llave de paso%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Impermeabilizante_20L.jpg' WHERE nombre LIKE 'Impermeabilizante%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Destornillador_Phillips.webp' WHERE nombre LIKE 'Destornillador Phillips%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Cable_THW_4mm_(100m).jpg' WHERE nombre LIKE 'Cable THW 4mm%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Llave_Inglesa_12.png' WHERE nombre LIKE 'Llave Inglesa%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Malla_Gallinero.jpg' WHERE nombre LIKE 'Malla Gallinero%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Silicona_Transparente.jpg' WHERE nombre LIKE 'Silicona%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Disco_de_Corte_7.jpg' WHERE nombre LIKE 'Disco de Corte%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Sierra_Circular_Makita.jpg' WHERE nombre LIKE 'Sierra Circular%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Lijadora_Orbital_Bosch.jpg' WHERE nombre LIKE 'Lijadora Orbital%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Nivel_de_Burbuja_60cm.jpg' WHERE nombre LIKE 'Nivel de Burbuja%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Llave_Allen_Set_9_pzs.jpg' WHERE nombre LIKE 'Llave Allen%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Cinta_Adhesiva_50m.jpg' WHERE nombre LIKE 'Cinta Adhesiva%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Bomba_de_Agua_1HP.png' WHERE nombre LIKE 'Bomba de Agua%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Foco_LED_15W.jpg' WHERE nombre LIKE 'Foco LED%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Cerradura_Seguridad.jpg' WHERE nombre LIKE 'Cerradura%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Bisagra_Premium_4.webp' WHERE nombre LIKE 'Bisagra%Premium%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Tornillo_Madera_3_(kg).jpg' WHERE nombre LIKE 'Tornillo%Madera%3%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Pegamento_PVC_250ml.jpg' WHERE nombre LIKE 'Pegamento PVC%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Grifo_Cocina.jpg' WHERE nombre LIKE 'Grifo%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Flexómetro_5m.jpg' WHERE nombre LIKE 'Flexómetro%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Destornillador_Set_6_pzs.jpg' WHERE nombre LIKE 'Destornillador Set 6%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
      `UPDATE productos SET imagen = '/images/productos/Brocha_4_Profesional.jpg' WHERE nombre LIKE 'Brocha%4%Profesional%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%')`,
    ];
    let imgCount = 0;
    for (const sql of imgUpdates) {
      const r = await query(sql);
      imgCount += r.rowCount || 0;
    }
    results.push(`Imágenes actualizadas: ${imgCount} productos`);

    /* ─── 2. Seed de compras ─── */
    const comprasCount = await query(`INSERT INTO compras (codigo, proveedor_id, proveedor, items, total, estado, notas, created_at) VALUES
('#CO-1718000001', 1, 'Cemento F', '[{"producto":"Cemento Portland 50kg","cantidad":50,"unidad":"pz","precio":35.00}]'::jsonb, 1750.00, 'Recibido', 'Compra regular de cemento para stock', '2026-05-28 09:00:00'),
('#CO-1718000002', 2, 'Herramientas Pro', '[{"producto":"Martillo Stanley 16oz","cantidad":20,"unidad":"pz","precio":48.00},{"producto":"Cinta Métrica 5m","cantidad":30,"unidad":"pz","precio":18.00}]'::jsonb, 1500.00, 'Recibido', 'Herramientas varias para taller', '2026-05-30 11:30:00'),
('#CO-1718000003', 3, 'ElectroSuministros', '[{"producto":"Cable THW 2.5mm (100m)","cantidad":10,"unidad":"pz","precio":140.00}]'::jsonb, 1400.00, 'Pendiente', 'Esperando confirmación de entrega', '2026-06-02 14:00:00'),
('#CO-1718000004', 1, 'Cemento F', '[{"producto":"Cemento CPN 50kg","cantidad":40,"unidad":"pz","precio":33.00}]'::jsonb, 1320.00, 'Recibido', 'Reabastecimiento cemento CPN', '2026-06-03 08:30:00'),
('#CO-1718000005', 2, 'Herramientas Pro', '[{"producto":"Taladro Bosch 500W","cantidad":5,"unidad":"pz","precio":350.00},{"producto":"Disco de Corte 7\\\"","cantidad":50,"unidad":"pz","precio":16.00}]'::jsonb, 2550.00, 'Recibido', 'Equipos eléctricos', '2026-06-04 10:00:00'),
('#CO-1718000006', 3, 'ElectroSuministros', '[{"producto":"Interruptor Simple","cantidad":100,"unidad":"pz","precio":6.00},{"producto":"Foco LED 15W","cantidad":80,"unidad":"pz","precio":8.00}]'::jsonb, 1240.00, 'En Proceso', 'Pedido grande de material eléctrico', '2026-06-06 07:45:00'),
('#CO-1718000007', 1, 'Cemento F', '[{"producto":"Cemento Portland 50kg","cantidad":30,"unidad":"pz","precio":35.00}]'::jsonb, 1050.00, 'Recibido', 'Compra semanal cemento', '2026-06-07 08:00:00'),
('#CO-1718000008', 2, 'Herramientas Pro', '[{"producto":"Nivel de Burbuja 60cm","cantidad":15,"unidad":"pz","precio":25.00},{"producto":"Llave Inglesa 12\\\"","cantidad":10,"unidad":"pz","precio":40.00},{"producto":"Destornillador Set 6 pzs","cantidad":12,"unidad":"pz","precio":33.00}]'::jsonb, 1171.00, 'Pendiente', 'Herramientas de medición y ajuste', '2026-06-09 15:30:00'),
('#CO-1718000010', 1, 'Cemento F', '[{"producto":"Varilla 3/8\\\" (12m)","cantidad":60,"unidad":"pz","precio":22.00}]'::jsonb, 1320.00, 'Recibido', 'Varillas para proyecto puente', '2026-06-10 09:15:00')
ON CONFLICT (codigo) DO NOTHING`);
    results.push(`Compras insertadas: ${comprasCount.rowCount}`);

    /* ─── 3. Seed de ventas ─── */
    const ventasCount = await query(`INSERT INTO ventas (pedido_id, vendedor_id, cliente_id, total, metodo_pago, notas, estado, created_at) VALUES
(1, 2, 1, 2727.50, 'Transferencia', 'Venta completada - materiales de construcción', 'Completada', '2026-06-03 10:30:00'),
(3, 2, 3, 1123.50, 'Efectivo', 'Venta en mostrador - herramientas menores', 'Completada', '2026-06-04 15:00:00'),
(4, 1, 1, 2089.50, 'Efectivo', 'Venta de materiales para obra', 'Completada', '2026-06-05 09:15:00'),
(7, 2, 1, 1349.25, 'Tarjeta', 'Pago con tarjeta de crédito', 'Completada', '2026-06-07 11:45:00'),
(9, 1, 3, 1081.50, 'Transferencia', 'Transferencia bancaria confirmada', 'Completada', '2026-06-09 14:20:00'),
(10, 2, 1, 310.80, 'Efectivo', 'Venta rápida en POS', 'Completada', '2026-06-10 16:00:00'),
(2, 1, 2, 1548.75, 'Depósito', 'Pendiente de confirmación de depósito', 'Pendiente', '2026-06-02 08:00:00'),
(8, 2, 2, 1044.75, 'QR', 'Pago vía QR pendiente', 'Pendiente', '2026-06-08 10:00:00'),
(6, 1, 3, 1463.70, 'Depósito', 'Esperando confirmación del banco', 'Pendiente', '2026-06-06 08:30:00')
ON CONFLICT DO NOTHING`);
    results.push(`Ventas insertadas: ${ventasCount.rowCount}`);

    /* ─── 4. Seed de pagos_cobros ─── */
    const pagosCount = await query(`INSERT INTO pagos_cobros (tipo, referencia_id, referencia_tipo, monto, metodo, concepto, created_at) VALUES
('Cobro', 1, 'venta', 2727.50, 'Transferencia', 'Cobro venta #1 - Constructora Los Andes', '2026-06-03 10:35:00'),
('Cobro', 3, 'venta', 1123.50, 'Efectivo', 'Cobro venta #3 - Distribuidora Norte', '2026-06-04 15:05:00'),
('Cobro', 4, 'venta', 2089.50, 'Efectivo', 'Cobro venta #4 - Constructora Los Andes', '2026-06-05 09:20:00'),
('Cobro', 7, 'venta', 1349.25, 'Tarjeta', 'Cobro venta #7 - Constructora Los Andes', '2026-06-07 11:50:00'),
('Cobro', 9, 'venta', 1081.50, 'Transferencia', 'Cobro venta #9 - Distribuidora Norte', '2026-06-09 14:25:00'),
('Cobro', 10, 'venta', 310.80, 'Efectivo', 'Cobro venta #10 - Constructora Los Andes', '2026-06-10 16:05:00'),
('Pago', NULL, NULL, 4500.00, 'Transferencia', 'Pago a proveedor Aceros del Sur', '2026-06-01 10:00:00'),
('Pago', NULL, NULL, 1200.00, 'Efectivo', 'Pago de servicios de logística', '2026-06-05 09:00:00'),
('Pago', NULL, NULL, 2800.00, 'Transferencia', 'Pago a Ferretería El Tornillo', '2026-06-08 11:30:00')
ON CONFLICT DO NOTHING`);
    results.push(`Pagos/Cobros insertados: ${pagosCount.rowCount}`);

    return res.status(200).json({ message: 'Migración completa', details: results.join(' | ') });
  } catch (err) {
    console.error('[Migration] error:', err);
    return res.status(500).json({ error: err.message });
  }
}
