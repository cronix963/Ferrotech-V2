import { query } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const result = await query('SELECT * FROM compras ORDER BY created_at DESC');
      return res.status(200).json({ data: result.rows, total: result.rows.length });
    }
    if (req.method === 'POST') {
      const { proveedor, proveedor_id, items, total, estado, notas } = req.body;
      if (!proveedor) return res.status(400).json({ error: 'Proveedor es requerido' });
      const codigo = '#CO-' + Date.now();
      const result = await query(
        `INSERT INTO compras (codigo, proveedor, proveedor_id, items, total, estado, notas) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7) RETURNING *`,
        [codigo, proveedor, proveedor_id||null, JSON.stringify(items||[]), total||0, estado||'Pendiente', notas||null]
      );
      return res.status(201).json({ data: result.rows[0] });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Compras error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
