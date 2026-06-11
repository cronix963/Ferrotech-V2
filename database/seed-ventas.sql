-- FERROTECH — Seed data for ventas (linked to existing pedidos)
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
-- Note: no ON CONFLICT — pagos_cobros has no unique constraint besides PK
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
