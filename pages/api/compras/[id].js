import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const result = await query('SELECT * FROM compras WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Compra no encontrada' });
      return res.status(200).json(result.rows[0]);
    }
    if (req.method === 'PUT') {
      const { proveedor_id, proveedor, items, total, estado, notas } = req.body;
      const result = await query(
        `UPDATE compras SET proveedor_id=$1, proveedor=$2, items=$3::jsonb, total=$4, estado=$5, notas=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
        [proveedor_id || null, proveedor, JSON.stringify(items || []), total || 0, estado || null, notas || null, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Compra no encontrada' });
      return res.status(200).json({ data: result.rows[0] });
    }
    if (req.method === 'DELETE') {
      const result = await query('DELETE FROM compras WHERE id = $1', [id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Compra no encontrada' });
      return res.status(200).json({ message: 'Compra eliminada' });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Compras/[id] error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
