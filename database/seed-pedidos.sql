-- FERROTECH — Seed data for pedidos (orders)
-- Run: psql -U postgres -d ferrotech_db -f database/seed-pedidos.sql

INSERT INTO pedidos (codigo, cliente_id, cliente, email, telefono, direccion, items, subtotal, impuesto, total, tipo, estado, pago, metodo_pago, notas, creado_por, created_at) VALUES

-- 1. Constructora Los Andes — tienda, Pendiente
('#P-1718000001', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
 '[{"producto_id":1,"nombre":"Cemento Portland 50kg","cantidad":20,"precio":45.00},{"producto_id":2,"nombre":"Varilla 3/8 (12m)","cantidad":15,"precio":28.50},{"producto_id":3,"nombre":"Ladrillo Fiscal","cantidad":500,"precio":2.80}]'::jsonb,
 2727.50, 0, 2727.50, 'tienda', 'Pendiente', 'Pendiente', 'Transferencia', 'Pedido grande para obra en construcción', 1, '2026-06-01 09:15:00'),

-- 2. Ingeniería Santa Cruz — tienda, En Proceso
('#P-1718000002', 2, 'Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789, Santa Cruz',
 '[{"producto_id":4,"nombre":"Martillo Stanley 16oz","cantidad":5,"precio":65.00},{"producto_id":5,"nombre":"Taladro Bosch 500W","cantidad":2,"precio":450.00},{"producto_id":11,"nombre":"Cinta Métrica 5m","cantidad":10,"precio":25.00}]'::jsonb,
 1548.75, 73.75, 1548.75, 'tienda', 'En Proceso', 'Pendiente', 'Efectivo', 'Urgente — necesitan para proyecto en curso', 2, '2026-06-02 11:30:00'),

-- 3. Distribuidora Norte — POS, Completado + Pagado
('#P-1718000003', 3, 'Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123, Santa Cruz',
 '[{"producto_id":6,"nombre":"Cable THW 2.5mm (100m)","cantidad":3,"precio":180.00},{"producto_id":12,"nombre":"Interruptor Simple","cantidad":20,"precio":8.50},{"producto_id":29,"nombre":"Foco LED 15W","cantidad":30,"precio":12.00}]'::jsonb,
 1123.50, 53.50, 1123.50, 'pos', 'Completado', 'Pagado', 'Tarjeta', 'Entregado en mostrador', 2, '2026-05-28 16:45:00'),

-- 4. Constructora Los Andes — tienda, Despachado
('#P-1718000004', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
 '[{"producto_id":6,"nombre":"Cable THW 2.5mm (100m)","cantidad":5,"precio":180.00},{"producto_id":16,"nombre":"Cable THW 4mm (100m)","cantidad":3,"precio":290.00},{"producto_id":20,"nombre":"Disco de Corte 7","cantidad":10,"precio":22.00}]'::jsonb,
 2089.50, 99.50, 2089.50, 'tienda', 'Despachado', 'Pagado', 'Transferencia', 'Enviado por transportista', 1, '2026-05-25 10:00:00'),

-- 5. Ingeniería Santa Cruz — POS, Cancelado
('#P-1718000005', 2, 'Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789, Santa Cruz',
 '[{"producto_id":7,"nombre":"Tubo PVC 2 (6m)","cantidad":10,"precio":32.00},{"producto_id":19,"nombre":"Silicona Transparente","cantidad":5,"precio":15.00},{"producto_id":34,"nombre":"Cemento CPN 50kg","cantidad":10,"precio":42.00}]'::jsonb,
 855.75, 40.75, 855.75, 'pos', 'Cancelado', 'Pendiente', 'Efectivo', 'Cliente canceló — pidió presupuesto nuevo', 2, '2026-05-20 14:20:00'),

-- 6. Distribuidora Norte — tienda, Preparación
('#P-1718000006', 3, 'Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123, Santa Cruz',
 '[{"producto_id":8,"nombre":"Pintura Látex 20L","cantidad":4,"precio":220.00},{"producto_id":14,"nombre":"Impermeabilizante 20L","cantidad":2,"precio":185.00},{"producto_id":38,"nombre":"Brocha 4 Profesional","cantidad":8,"precio":18.00}]'::jsonb,
 1463.70, 69.70, 1463.70, 'tienda', 'Preparación', 'Pendiente', 'Tarjeta', 'Preparando para despacho', 2, '2026-06-05 08:00:00'),

-- 7. Constructora Los Andes — tienda, Completado + Pagado
('#P-1718000007', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
 '[{"producto_id":7,"nombre":"Tubo PVC 2 (6m)","cantidad":15,"precio":32.00},{"producto_id":25,"nombre":"Bomba de Agua 1HP","cantidad":1,"precio":520.00},{"producto_id":33,"nombre":"Grifo Cocina","cantidad":3,"precio":95.00}]'::jsonb,
 1349.25, 64.25, 1349.25, 'tienda', 'Completado', 'Pagado', 'Transferencia', 'Entregado completo', 1, '2026-05-15 12:00:00'),

-- 8. Ingeniería Santa Cruz — tienda, En Proceso
('#P-1718000008', 2, 'Ingeniería Santa Cruz', 'ing.sc@email.com', '7227890', 'Calle 21 de Mayo 789, Santa Cruz',
 '[{"producto_id":5,"nombre":"Taladro Bosch 500W","cantidad":1,"precio":450.00},{"producto_id":17,"nombre":"Llave Inglesa 12","cantidad":4,"precio":55.00},{"producto_id":20,"nombre":"Disco de Corte 7","cantidad":10,"precio":22.00},{"producto_id":24,"nombre":"Nivel de Burbuja 60cm","cantidad":3,"precio":35.00}]'::jsonb,
 1044.75, 49.75, 1044.75, 'tienda', 'En Proceso', 'Pagado', 'Efectivo', 'Pagaron, estamos preparando el pedido', 2, '2026-06-08 09:30:00'),

-- 9. Distribuidora Norte — tienda, Pendiente
('#P-1718000009', 3, 'Distribuidora Norte', 'norte@email.com', '7224567', 'Av. Banzer 123, Santa Cruz',
 '[{"producto_id":30,"nombre":"Sierra Circular Makita","cantidad":1,"precio":650.00},{"producto_id":31,"nombre":"Lijadora Orbital Bosch","cantidad":1,"precio":380.00}]'::jsonb,
 1081.50, 51.50, 1081.50, 'tienda', 'Pendiente', 'Pendiente', 'Transferencia', 'Esperando confirmación de pago', 1, '2026-06-10 07:15:00'),

-- 10. Constructora Los Andes — POS, Pagado (mostrador)
('#P-1718000010', 1, 'Constructora Los Andes', 'losandes@email.com', '7223456', 'Av. Ballivián 456, Santa Cruz',
 '[{"producto_id":10,"nombre":"Clavo 2 (1kg)","cantidad":5,"precio":12.00},{"producto_id":35,"nombre":"Tornillo Madera 3 (kg)","cantidad":3,"precio":22.00},{"producto_id":28,"nombre":"Cerradura Seguridad","cantidad":2,"precio":85.00}]'::jsonb,
 310.80, 14.80, 310.80, 'pos', 'Completado', 'Pagado', 'Tarjeta', 'Compra en mostrador', 2, '2026-06-09 17:50:00')
ON CONFLICT (codigo) DO NOTHING;
