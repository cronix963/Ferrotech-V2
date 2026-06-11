import { query } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const result = await query(`
        SELECT
          v.id,
          v.pedido_id,
          v.vendedor_id,
          v.cliente_id,
          COALESCE(c.nombre, 'Cliente #' || v.cliente_id) AS cliente,
          v.total,
          v.metodo_pago AS metodo,
          v.estado,
          v.notas,
          v.created_at AS fecha
        FROM ventas v
        LEFT JOIN clientes c ON c.id = v.cliente_id
        ORDER BY v.created_at DESC
      `);
      return res.status(200).json({ data: result.rows, total: result.rows.length });
    }
    if (req.method === 'POST') {
      const { pedido_id, vendedor_id, cliente_id, total, metodo_pago, metodo, notas, estado } = req.body;
      const pago = metodo_pago || metodo || null;
      const result = await query(
        `INSERT INTO ventas (pedido_id, vendedor_id, cliente_id, total, metodo_pago, notas, estado) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [pedido_id||null, vendedor_id||null, cliente_id||null, total||0, pago, notas||null, estado||'Completada']
      );
      return res.status(201).json({ data: result.rows[0] });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Ventas error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
