import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  try {
    const results = [];

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
