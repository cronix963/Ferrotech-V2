import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const result = await query('SELECT * FROM envios WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Envío no encontrado' });
      return res.status(200).json(result.rows[0]);
    }
    if (req.method === 'PUT') {
      const { direccion, ciudad, transportista, tracking_numero, estado, fecha_salida, fecha_entrega, notas } = req.body;
      const result = await query(
        `UPDATE envios SET direccion=$1, ciudad=$2, transportista=$3, tracking_numero=$4, estado=$5, fecha_salida=$6, fecha_entrega=$7, notas=$8, updated_at=NOW() WHERE id=$9 RETURNING *`,
        [direccion, ciudad || null, transportista || null, tracking_numero || null, estado || null, fecha_salida || null, fecha_entrega || null, notas || null, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Envío no encontrado' });
      return res.status(200).json({ data: result.rows[0] });
    }
    if (req.method === 'DELETE') {
      const result = await query('DELETE FROM envios WHERE id = $1', [id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Envío no encontrado' });
      return res.status(200).json({ message: 'Envío eliminado' });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('[API] Envios/[id] error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
